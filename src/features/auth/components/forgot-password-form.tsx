'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, Loader2, Mail } from 'lucide-react';
import { AuthCard } from '@/features/auth/components/auth-card';
import { FormField } from '@/features/auth/components/form-field';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '@/features/auth/schemas/auth.schema';
import { authService, getApiErrorMessage } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ForgotPasswordForm() {
  const router = useRouter();
  const [apiError, setApiError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setApiError('');
    try {
      await authService.forgotPassword(data.email);
      setSubmittedEmail(data.email);
      setIsSuccess(true);
    } catch (error) {
      setApiError(getApiErrorMessage(error));
    }
  };

  return (
    <AuthCard
      title={isSuccess ? 'Check Your Email' : 'Forgot Password'}
      subtitle={
        isSuccess
          ? "We've sent a 6-digit reset code to your email"
          : "Enter your email and we'll send you a reset code"
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

            <div className="flex items-center justify-center gap-2 text-sm text-ink-muted">
              <Mail className="h-4 w-4" />
              <span>{submittedEmail}</span>
            </div>

            <p className="text-sm text-ink-muted">
              Enter the code on the reset password page to choose a new password. The code expires in
              10 minutes.
            </p>

            <Button
              type="button"
              variant="default"
              size="lg"
              className="w-full"
              onClick={() =>
                router.push(`/reset-password?email=${encodeURIComponent(submittedEmail)}`)
              }
            >
              Enter Reset Code
            </Button>

            <button
              type="button"
              onClick={() => setIsSuccess(false)}
              className="text-sm text-ink-muted transition-colors hover:text-foreground"
            >
              Try a different email
            </button>
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

            <Button type="submit" variant="default" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Code'
              )}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>

      <Link
        href="/login"
        className="mt-6 flex items-center justify-center gap-2 text-sm text-ink-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </Link>
    </AuthCard>
  );
}
