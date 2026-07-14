'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, PackageX, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { AuthHydration } from '@/features/auth/components/auth-hydration';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { Button } from '@/components/ui/button';

export function TrackingGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthHydration>
      <TrackingGuardInner>{children}</TrackingGuardInner>
    </AuthHydration>
  );
}

function TrackingGuardInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, accessToken, isHydrated } = useAuthStore();

  useEffect(() => {
    if (isHydrated && (!user || !accessToken)) {
      const path = typeof window !== 'undefined' ? window.location.pathname : '/account/orders';
      router.replace(`/login?redirect=${encodeURIComponent(path)}`);
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

interface TrackingErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function TrackingErrorState({ message, onRetry }: TrackingErrorStateProps) {
  return (
    <div className="section-padding pt-8">
      <div className="container-premium">
        <div className="flex flex-col items-center rounded-3xl border border-border/60 bg-surface-elevated px-6 py-16 text-center shadow-soft">
          <PackageX className="mb-4 h-12 w-12 text-ink-faint" />
          <h2 className="font-display text-xl text-foreground">Unable to load tracking</h2>
          <p className="mt-2 max-w-md text-sm text-ink-muted">{message}</p>
          <div className="mt-6 flex gap-3">
            {onRetry && (
              <Button variant="outline" onClick={onRetry}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
              </Button>
            )}
            <Button variant="champagne" asChild>
              <Link href="/account/orders">View Orders</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
