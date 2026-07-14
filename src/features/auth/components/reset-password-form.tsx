'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { AuthCard } from '@/features/auth/components/auth-card';
import { FormField } from '@/features/auth/components/form-field';
import { PasswordInput } from '@/features/auth/components/password-input';
import { OtpInput } from '@/features/auth/components/otp-input';
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '@/features/auth/schemas/auth.schema';
import { authService, getApiErrorMessage } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get('email') ?? '';
  const [apiError, setApiError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: emailFromQuery, otp: '' },
  });

  useEffect(() => {
    if (emailFromQuery) {
      setValue('email', emailFromQuery);
    }
  }, [emailFromQuery, setValue]);

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setApiError('');
    try {
      await authService.resetPassword(data.email, data.otp, data.password);
      setIsSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (error) {
      setApiError(getApiErrorMessage(error));
    }
  };

  const handleResend = async (email: string) => {
    if (!canResend || !email) return;
    try {
      await authService.resendOtp(email);
      setCountdown(60);
      setCanResend(false);
      setApiError('');
    } catch (error) {
      setApiError(getApiErrorMessage(error));
    }
  };

  return (
    <AuthCard
      title={isSuccess ? 'Password Updated' : 'Reset Password'}
      subtitle={
        isSuccess
          ? 'Your password has been successfully reset'
          : 'Enter the code from your email and choose a new password'
      }
    >
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30"
            >
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </motion.div>
            <p className="text-sm text-ink-muted">Redirecting you to sign in...</p>
            <Button variant="default" size="lg" className="w-full" asChild>
              <Link href="/login">Sign In Now</Link>
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            {apiError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                {apiError}
              </div>
            )}

            <FormField label="Email" error={errors.email?.message}>
              <Input type="email" placeholder="you@example.com" {...register('email')} />
            </FormField>

            <Controller
              name="otp"
              control={control}
              render={({ field }) => (
                <FormField label="Reset Code" error={errors.otp?.message}>
                  <OtpInput value={field.value} onChange={field.onChange} error={errors.otp?.message} />
                </FormField>
              )}
            />

            <FormField label="New Password" error={errors.password?.message}>
              <PasswordInput placeholder="Enter new password" {...register('password')} />
            </FormField>

            <FormField label="Confirm Password" error={errors.confirmPassword?.message}>
              <PasswordInput placeholder="Confirm new password" {...register('confirmPassword')} />
            </FormField>

            <div className="text-center text-sm text-ink-muted">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleSubmit((data) => handleResend(data.email))}
                  className="font-medium text-champagne-dark transition-colors hover:text-champagne dark:text-champagne"
                >
                  Resend code
                </button>
              ) : (
                <span>
                  Resend code in{' '}
                  <span className="font-medium text-foreground">{countdown}s</span>
                </span>
              )}
            </div>

            <Button type="submit" variant="champagne" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>

      {!isSuccess && (
        <Link
          href="/login"
          className="mt-6 flex items-center justify-center gap-2 text-sm text-ink-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      )}
    </AuthCard>
  );
}
