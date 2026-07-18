import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';
const AUTH_STORAGE_KEY = 'ayari-auth';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { accessToken?: string } };
    return parsed.state?.accessToken ?? null;
  } catch {
    return null;
  }
}

function writeStoredAccessToken(accessToken: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    const parsed = raw
      ? (JSON.parse(raw) as { state?: Record<string, unknown>; version?: number })
      : { state: {} };
    parsed.state = { ...(parsed.state ?? {}), accessToken };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    // ignore storage failures — request retry still uses Authorization header
  }
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let requestInterceptorId: number | null = null;
let responseInterceptorId: number | null = null;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    const { data } = await axios.post<{
      success: boolean;
      data: { accessToken: string };
    }>(
      `${API_URL}/auth/refresh-token`,
      {},
      { withCredentials: true, headers: { 'Content-Type': 'application/json' } },
    );
    const token = data?.data?.accessToken ?? null;
    if (token) {
      writeStoredAccessToken(token);
      void import('@/features/auth/stores/auth.store').then(({ useAuthStore }) => {
        const { user, setSession, setAccessToken } = useAuthStore.getState();
        if (typeof setAccessToken === 'function') {
          setAccessToken(token);
        } else if (user) {
          setSession(user, token);
        }
      });
    }
    return token;
  } catch {
    return null;
  }
}

function isAuthRefreshUrl(url?: string): boolean {
  if (!url) return false;
  return (
    url.includes('/auth/refresh-token') ||
    url.includes('/auth/login') ||
    url.includes('/auth/logout') ||
    url.includes('/auth/register')
  );
}

export function setupAuthInterceptor(): void {
  if (requestInterceptorId === null) {
    requestInterceptorId = api.interceptors.request.use((config) => {
      const token = getStoredAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  if (responseInterceptorId !== null) return;

  responseInterceptorId = api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const original = error.config as RetriableConfig | undefined;
      const status = error.response?.status;

      if (!original || status !== 401 || original._retry || isAuthRefreshUrl(original.url)) {
        return Promise.reject(error);
      }

      original._retry = true;

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newToken = await refreshPromise;
      if (!newToken) {
        return Promise.reject(error);
      }

      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    },
  );
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    accessToken: string;
  };
}

interface MeResponse {
  success: boolean;
  data: { user: AuthUser };
}

export const authService = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),

  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => api.post<AuthResponse>('/auth/register', data),

  getMe: () => api.get<MeResponse>('/auth/me'),

  logout: () => api.post('/auth/logout'),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (email: string, otp: string, password: string) =>
    api.post('/auth/reset-password', { email, otp, password }),

  resendOtp: (email: string) => api.post('/auth/resend-otp', { email }),
};

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        return 'Cannot reach the API server. Make sure the backend is running on localhost:5000.';
      }
      return 'Network error. Please check your connection and try again.';
    }

    const data = error.response.data as
      | { message?: string; errors?: Array<{ field: string; message: string }> }
      | undefined;

    if (data?.errors?.length) {
      return data.errors.map((entry) => entry.message).join('. ');
    }

    return data?.message ?? 'Something went wrong. Please try again.';
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}
