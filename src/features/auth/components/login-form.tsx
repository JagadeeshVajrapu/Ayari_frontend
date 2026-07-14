'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { AuthCard } from '@/features/auth/components/auth-card';
import { FormField } from '@/features/auth/components/form-field';
import { PasswordInput } from '@/features/auth/components/password-input';
import { loginSchema, type LoginFormData } from '@/features/auth/schemas/auth.schema';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { authService, getApiErrorMessage } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered') === 'true';
  const setSession = useAuthStore((s) => s.setSession);
  const [apiError, setApiError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    setApiError('');
    try {
      const res = await authService.login(data.email, data.password);
      const { user, accessToken } = res.data.data;
      setSession(user, accessToken);
      const redirect = new URLSearchParams(window.location.search).get('redirect');
      router.push(redirect && redirect.startsWith('/') ? redirect : '/account');
    } catch (error) {
      setApiError(getApiErrorMessage(error));
    }
  };

  return (
    <AuthCard title="Welcome Back" subtitle="Sign in to continue your luxury shopping experience">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {registered && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400"
          >
            Account created successfully. Sign in with your email and password.
          </motion.div>
        )}

        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
          >
            {apiError}
          </motion.div>
        )}

        <FormField label="Email" error={errors.email?.message}>
          <Input type="email" placeholder="you@example.com" {...register('email')} />
        </FormField>

        <FormField label="Password" error={errors.password?.message}>
          <PasswordInput placeholder="Enter your password" {...register('password')} />
        </FormField>

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-muted">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border accent-champagne"
              {...register('remember')}
            />
            Remember me
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-champagne-dark transition-colors hover:text-champagne dark:text-champagne"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="default" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>

        <div className="relative py-2">
          <Separator />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-transparent px-3 text-xs text-ink-faint">
            or
          </span>
        </div>

        <p className="text-center text-sm text-ink-muted">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-medium text-foreground underline-offset-4 transition-colors hover:text-champagne-dark hover:underline dark:hover:text-champagne"
          >
            Create one
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
