import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import type { AuthUser } from '@/services/auth.service';
import { authService } from '@/services/auth.service';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isHydrated: boolean;
  setSession: (user: AuthUser, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  setUser: (user: AuthUser) => void;
  clearSession: () => void;
  setHydrated: (value: boolean) => void;
  fetchProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isHydrated: false,

      setSession: (user, accessToken) => set({ user, accessToken }),

      setAccessToken: (accessToken) => set({ accessToken }),

      setUser: (user) => set({ user }),

      clearSession: () => set({ user: null, accessToken: null }),

      setHydrated: (value) => set({ isHydrated: value }),

      fetchProfile: async () => {
        const { accessToken } = get();
        if (!accessToken) return;

        try {
          const { data } = await authService.getMe();
          set({ user: data.data.user });
        } catch (error) {
          // Only clear session on definitive auth failure — not network/server blips
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            set({ user: null, accessToken: null });
          }
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch {
          // Clear local session even if API fails
        }
        set({ user: null, accessToken: null });
      },
    }),
    {
      name: 'ayari-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export function useIsAuthenticated(): boolean {
  return useAuthStore((s) => Boolean(s.user && s.accessToken));
}
