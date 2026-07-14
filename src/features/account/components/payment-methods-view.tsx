'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Plus, Smartphone, Trash2 } from 'lucide-react';
import { MOCK_PAYMENT_METHODS, type PaymentMethod } from '@/features/account/lib/account-data';
import { AccountShell } from './account-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function PaymentMethodsView() {
  const [methods, setMethods] = useState<PaymentMethod[]>(MOCK_PAYMENT_METHODS);

  const setDefault = (id: string) => {
    setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
  };

  const removeMethod = (id: string) => {
    setMethods((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <AccountShell title="Payment Methods" description="Manage your saved payment options">
      <div className="space-y-4">
        <div className="rounded-3xl border border-champagne/30 bg-champagne/5 p-4 text-sm text-ink-muted">
          Payments are processed securely via Razorpay. Saved methods are encrypted and PCI compliant.
        </div>

        <Button variant="outline" className="w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Add Payment Method
        </Button>

        {methods.map((method, index) => (
          <motion.div
            key={method.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'flex items-center gap-4 rounded-3xl border bg-surface-elevated p-5 shadow-soft',
              method.isDefault ? 'border-champagne/50' : 'border-border/60',
            )}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
              {method.type === 'card' ? (
                <CreditCard className="h-5 w-5 text-champagne-dark dark:text-champagne" />
              ) : (
                <Smartphone className="h-5 w-5 text-champagne-dark dark:text-champagne" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-foreground">{method.label}</p>
                {method.isDefault && <Badge variant="default">Default</Badge>}
              </div>
              {method.type === 'card' && method.expiry && (
                <p className="text-sm text-ink-muted">Expires {method.expiry}</p>
              )}
              {method.type === 'upi' && method.upiId && (
                <p className="text-sm text-ink-muted">{method.upiId}</p>
              )}
            </div>

            <div className="flex gap-1">
              {!method.isDefault && (
                <Button variant="ghost" size="sm" onClick={() => setDefault(method.id)}>
                  Set default
                </Button>
              )}
              <button
                type="button"
                onClick={() => removeMethod(method.id)}
                className="rounded-lg p-2 text-ink-muted hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                aria-label="Remove payment method"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </AccountShell>
  );
}
