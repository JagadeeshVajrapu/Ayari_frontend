'use client';

import dynamic from 'next/dynamic';
import { ThemeProvider } from 'next-themes';
import { AuthHydration } from '@/features/auth/components/auth-hydration';

const RouteProgress = dynamic(
  () => import('@/components/motion/route-progress').then((m) => ({ default: m.RouteProgress })),
  { ssr: false },
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthHydration>
        <RouteProgress />
        {children}
      </AuthHydration>
    </ThemeProvider>
  );
}
