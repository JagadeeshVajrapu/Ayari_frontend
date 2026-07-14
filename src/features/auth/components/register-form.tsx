'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader2 } from 'lucide-react';
import { AuthCard } from '@/features/auth/components/auth-card';
import { FormField } from '@/features/auth/components/form-field';
import { PasswordInput } from '@/features/auth/components/password-input';
import { registerSchema, type RegisterFormData } from '@/features/auth/schemas/auth.schema';
import { authService, getApiErrorMessage } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function RegisterForm() {
  const router = useRouter();
  const [apiError, setApiError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { acceptTerms: false },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setApiError('');
    try {
      await authService.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone?.trim() || undefined,
      });
      setIsSuccess(true);
    } catch (error) {
      setApiError(getApiErrorMessage(error));
    }
  };

  return (
    <AuthCard
      title={isSuccess ? 'Welcome to AYARI' : 'Create Account'}
      subtitle={
        isSuccess
          ? 'Your account has been created successfully'
          : 'Join AYARI and discover curated luxury fashion'
      }
    >
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-champagne/10"
            >
              <CheckCircle className="h-8 w-8 text-champagne-dark dark:text-champagne" />
            </motion.div>

            <p className="text-sm text-ink-muted">
              You have been successfully registered. Sign in with your email and password to start
              shopping.
            </p>

            <Button
              type="button"
              variant="champagne"
              size="lg"
              className="w-full"
              onClick={() => router.push('/login?registered=true')}
            >
              Sign In
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
              >
                {apiError}
              </motion.div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField label="First Name" error={errors.firstName?.message}>
                <Input placeholder="Jane" {...register('firstName')} />
              </FormField>
              <FormField label="Last Name" error={errors.lastName?.message}>
                <Input placeholder="Doe" {...register('lastName')} />
              </FormField>
            </div>

            <FormField label="Email" error={errors.email?.message}>
              <Input type="email" placeholder="you@example.com" {...register('email')} />
            </FormField>

            <FormField label="Phone (optional)" error={errors.phone?.message}>
              <Input type="tel" placeholder="+91 98765 43210" {...register('phone')} />
            </FormField>

            <FormField label="Password" error={errors.password?.message}>
              <PasswordInput placeholder="Create a strong password" {...register('password')} />
            </FormField>

            <FormField label="Confirm Password" error={errors.confirmPassword?.message}>
              <PasswordInput placeholder="Confirm your password" {...register('confirmPassword')} />
            </FormField>

            <div>
              <label className="flex cursor-pointer items-start gap-3 text-sm text-ink-muted">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-border accent-champagne"
                  {...register('acceptTerms')}
                />
                <span>
                  I agree to the{' '}
                  <Link href="/terms" className="text-foreground underline-offset-2 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-foreground underline-offset-2 hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="mt-1 text-xs text-red-500">{errors.acceptTerms.message}</p>
              )}
            </div>

            <Button type="submit" variant="champagne" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            <p className="text-center text-sm text-ink-muted">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-foreground underline-offset-4 hover:text-champagne-dark hover:underline dark:hover:text-champagne"
              >
                Sign in
              </Link>
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthCard>
  );
}
