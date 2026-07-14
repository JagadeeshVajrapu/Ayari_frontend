'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Store, Bell, Shield, Globe } from 'lucide-react';
import { AdminShell } from './admin-shell';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function ToggleRow({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: typeof Store;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-champagne" />
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-foreground/40">{description}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors',
          checked ? 'bg-champagne' : 'bg-white/10',
        )}
      >
        <span className={cn(
          'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
          checked && 'translate-x-5',
        )} />
      </button>
    </div>
  );
}

export function AdminSettingsView() {
  const [maintenance, setMaintenance] = useState(false);
  const [orderEmails, setOrderEmails] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [reviewModeration, setReviewModeration] = useState(true);

  return (
    <AdminShell title="Settings" description="Configure your store and admin preferences">
      <div className="mx-auto max-w-2xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border/60 bg-card/50 p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <Store className="h-5 w-5 text-champagne" />
            <h2 className="font-display text-lg text-foreground">Store Settings</h2>
          </div>
          <div className="divide-y divide-white/10">
            <ToggleRow
              icon={Globe}
              label="Maintenance Mode"
              description="Temporarily disable the storefront"
              checked={maintenance}
              onChange={setMaintenance}
            />
            <ToggleRow
              icon={Shield}
              label="Review Moderation"
              description="Require approval before reviews are published"
              checked={reviewModeration}
              onChange={setReviewModeration}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-border/60 bg-card/50 p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-champagne" />
            <h2 className="font-display text-lg text-foreground">Notifications</h2>
          </div>
          <div className="divide-y divide-white/10">
            <ToggleRow
              icon={Bell}
              label="New Order Alerts"
              description="Email when a new order is placed"
              checked={orderEmails}
              onChange={setOrderEmails}
            />
            <ToggleRow
              icon={Bell}
              label="Low Stock Alerts"
              description="Notify when products fall below threshold"
              checked={lowStockAlerts}
              onChange={setLowStockAlerts}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border/60 bg-card/50 p-6"
        >
          <h2 className="font-display text-lg text-foreground">Store Information</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-xs text-foreground/40 uppercase">Store Name</label>
              <input
                defaultValue="AYARI"
                className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <div>
              <label className="text-xs text-foreground/40 uppercase">Support Email</label>
              <input
                defaultValue="support@ayari.com"
                className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <div>
              <label className="text-xs text-foreground/40 uppercase">Currency</label>
              <input
                defaultValue="INR (₹)"
                readOnly
                className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground/50"
              />
            </div>
          </div>
          <Button variant="champagne" className="mt-6">
            Save Settings
          </Button>
        </motion.div>
      </div>
    </AdminShell>
  );
}
