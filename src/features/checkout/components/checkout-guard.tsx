'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AuthHydration } from '@/features/auth/components/auth-hydration';
import { useAuthStore } from '@/features/auth/stores/auth.store';

export function CheckoutGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthHydration>
      <CheckoutGuardInner>{children}</CheckoutGuardInner>
    </AuthHydration>
  );
}

function CheckoutGuardInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, accessToken, isHydrated } = useAuthStore();

  useEffect(() => {
    if (isHydrated && (!user || !accessToken)) {
      router.replace('/login?redirect=/checkout');
    }
  }, [isHydrated, user, accessToken, router]);

  if (!isHydrated || !user || !accessToken) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-champagne-dark" />
      </div>
    );
  }

  return <>{children}</>;
}
