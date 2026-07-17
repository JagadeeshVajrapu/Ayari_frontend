'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Footer } from '@/components/layout/footer';

const SiteHeader = dynamic(
  () => import('@/components/layout/site-header').then((m) => ({ default: m.SiteHeader })),
  { loading: () => <div className="h-20" /> },
);

const PageTransition = dynamic(
  () => import('@/components/motion/page-transition').then((m) => ({ default: m.PageTransition })),
  { loading: () => null },
);

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
