'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { AuthHydration } from '@/features/auth/components/auth-hydration';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthHydration>
      <AdminGuardInner>{children}</AdminGuardInner>
    </AuthHydration>
  );
}

function AdminGuardInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, accessToken, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;
    if (!user || !accessToken) {
      router.replace('/login?redirect=/admin');
      return;
    }
    if (user.role !== 'ADMIN') {
      router.replace('/account');
    }
  }, [isHydrated, user, accessToken, router]);

  if (!isHydrated || !user || !accessToken || user.role !== 'ADMIN') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-champagne" />
      </div>
    );
  }

  return <>{children}</>;
}

export function useIsAdmin(): boolean {
  return useAuthStore((s) => s.user?.role === 'ADMIN');
}
