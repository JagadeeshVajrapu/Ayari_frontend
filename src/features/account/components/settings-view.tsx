'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Bell, Mail, Shield, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { AccountShell } from './account-shell';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

function ToggleRow({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: typeof Bell;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-champagne-dark dark:text-champagne" />
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-ink-muted">{description}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors',
          checked ? 'bg-champagne' : 'bg-muted',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
            checked && 'translate-x-5',
          )}
        />
      </button>
    </div>
  );
}

export function SettingsView() {
  const { theme, setTheme } = useTheme();
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);

  return (
    <AccountShell title="Settings" description="Customize your account preferences">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-border/60 bg-surface-elevated p-6 shadow-soft"
        >
          <h3 className="font-display text-lg text-foreground">Appearance</h3>
          <p className="mt-1 text-sm text-ink-muted">Choose your preferred theme</p>
          <div className="mt-4 flex gap-3">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              onClick={() => setTheme('light')}
              className="flex-1"
            >
              <Sun className="h-4 w-4" />
              Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              onClick={() => setTheme('dark')}
              className="flex-1"
            >
              <Moon className="h-4 w-4" />
              Dark
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              onClick={() => setTheme('system')}
              className="flex-1"
            >
              <Monitor className="h-4 w-4" />
              System
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-3xl border border-border/60 bg-surface-elevated p-6 shadow-soft"
        >
          <h3 className="font-display text-lg text-foreground">Notifications</h3>
          <div className="divide-y divide-border/60">
            <ToggleRow
              icon={Mail}
              label="Email notifications"
              description="Receive updates via email"
              checked={emailNotifs}
              onChange={setEmailNotifs}
            />
            <ToggleRow
              icon={Bell}
              label="Order updates"
              description="Shipping and delivery alerts"
              checked={orderUpdates}
              onChange={setOrderUpdates}
            />
            <ToggleRow
              icon={Bell}
              label="Promotions"
              description="Sales, offers, and new arrivals"
              checked={promotions}
              onChange={setPromotions}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-border/60 bg-surface-elevated p-6 shadow-soft"
        >
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-champagne-dark dark:text-champagne" />
            <div className="flex-1">
              <h3 className="font-display text-lg text-foreground">Privacy & Security</h3>
              <p className="mt-1 text-sm text-ink-muted">
                Manage password and account security settings
              </p>
              <Separator className="my-4" />
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm">
                  Change Password
                </Button>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AccountShell>
  );
}
