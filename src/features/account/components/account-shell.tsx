'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { AuthHydration } from '@/features/auth/components/auth-hydration';
import {
  AccountSidebar,
  AccountMobileDrawer,
} from '@/features/account/components/account-sidebar';

export function AccountGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthHydration>
      <AccountGuardInner>{children}</AccountGuardInner>
    </AuthHydration>
  );
}

function AccountGuardInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, accessToken, isHydrated } = useAuthStore();

  useEffect(() => {
    if (isHydrated && (!user || !accessToken)) {
      router.replace('/login?redirect=/account');
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

export function AccountShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="section-padding pt-8">
      <div className="container-premium">
        <div className="mb-6 hidden lg:block">
          <p className="text-xs tracking-wider text-ink-faint uppercase">My Account</p>
          <h1 className="font-display text-display-md text-foreground">{title}</h1>
          {description && <p className="mt-2 text-ink-muted">{description}</p>}
        </div>

        <div className="mb-6 flex items-center justify-between lg:hidden">
          <div>
            <p className="text-xs tracking-wider text-ink-faint uppercase">My Account</p>
            <h1 className="font-display text-2xl text-foreground">{title}</h1>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-elevated"
            aria-label="Open menu"
          >
            <span className="sr-only">Menu</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <AccountMobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
          )}
        </AnimatePresence>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-10">
          <div className="hidden lg:block">
            <div className="sticky top-32">
              <AccountSidebar />
            </div>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
