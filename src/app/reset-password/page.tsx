import { Suspense } from 'react';
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form';

export const metadata = {
  title: 'Reset Password — AYARI',
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-4xl glass-auth" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
