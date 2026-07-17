import { Suspense } from 'react';
import { LoginForm } from '@/features/auth/components/login-form';

export const metadata = {
  title: 'Sign In — AYARI',
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
