'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { setupAuthInterceptor } from '@/services/auth.service';

let interceptorSetup = false;

export function AuthHydration({ children }: { children: React.ReactNode }) {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);

  useEffect(() => {
    if (!interceptorSetup) {
      setupAuthInterceptor();
      interceptorSetup = true;
    }
  }, []);

  useEffect(() => {
    if (isHydrated && accessToken) {
      fetchProfile();
    }
  }, [isHydrated, accessToken, fetchProfile]);

  return children;
}
