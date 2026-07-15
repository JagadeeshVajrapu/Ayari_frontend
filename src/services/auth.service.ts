import axios from 'axios';

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

let interceptorId: number | null = null;

export function setupAuthInterceptor(): void {
  if (interceptorId !== null) return;

  interceptorId = api.interceptors.request.use((config) => {
    const token = getStoredAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
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
