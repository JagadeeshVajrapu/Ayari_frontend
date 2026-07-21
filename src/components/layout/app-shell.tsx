'use client';

import { usePathname } from 'next/navigation';
import { Footer } from '@/components/layout/footer';
import { SiteHeader } from '@/components/layout/site-header';
import { PageTransition } from '@/components/motion/page-transition';

const AUTH_PREFIXES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-otp',
];

function isBareShell(pathname: string): boolean {
  if (pathname.startsWith('/admin')) return true;
  return AUTH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Applies storefront chrome (header/footer) for shop pages only.
 * Admin and auth routes render children alone so their own layouts control UI.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const bare = isBareShell(pathname);

  if (bare) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="outline-none">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </>
  );
}
