'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, Mail } from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { FormField } from '@/features/auth/components/form-field';
import { profileSchema, type ProfileFormData } from '@/features/account/schemas/account.schema';
import { AccountShell } from './account-shell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { userService } from '@/services/admin.service';
import { getApiErrorMessage } from '@/services/auth.service';

export function ProfileView() {
  const { user, setUser } = useAuthStore();
  const [saved, setSaved] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    setSaved(false);
    setApiError('');
    try {
      const { data: res } = await userService.updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
      });
      setUser(res.data.data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    }
  };

  return (
    <AccountShell title="Profile" description="Manage your personal information">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-4 rounded-3xl border border-border/60 bg-surface-elevated p-6 shadow-soft"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-champagne/30 to-champagne/10 font-display text-3xl text-ink">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </div>
          <div>
            <h2 className="font-display text-xl text-foreground">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-sm text-ink-muted">{user?.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {user?.emailVerified ? (
                <Badge variant="default">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="outline">
                  <Mail className="mr-1 h-3 w-3" />
                  Unverified
                </Badge>
              )}
            </div>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-3xl border border-border/60 bg-surface-elevated p-6 shadow-soft sm:p-8"
        >
          <h3 className="mb-6 font-display text-lg text-foreground">Edit Profile</h3>

          {apiError && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{apiError}</div>
          )}

          {saved && (
            <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-400">
              Profile updated successfully
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="First Name" error={errors.firstName?.message}>
              <Input {...register('firstName')} />
            </FormField>
            <FormField label="Last Name" error={errors.lastName?.message}>
              <Input {...register('lastName')} />
            </FormField>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField label="Email" error={errors.email?.message}>
              <Input type="email" readOnly disabled {...register('email')} />
            </FormField>
            <FormField label="Phone" error={errors.phone?.message}>
              <Input type="tel" placeholder="+91 98765 43210" {...register('phone')} />
            </FormField>
          </div>

          <Button type="submit" variant="champagne" className="mt-6" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </motion.form>
      </div>
    </AccountShell>
  );
}
