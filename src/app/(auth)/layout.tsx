'use client';

import { AuthLayout } from '@/features/auth/components/auth-layout';
import { PageTransition } from '@/components/motion/page-transition';

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthLayout>
      <PageTransition>{children}</PageTransition>
    </AuthLayout>
  );
}
