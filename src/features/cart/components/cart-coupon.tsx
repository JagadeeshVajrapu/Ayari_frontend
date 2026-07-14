'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, X, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useShopStore } from '@/features/shop/stores/shop.store';

export function CartCoupon() {
  const { appliedCoupon, setAppliedCoupon } = useShopStore();
  const [code, setCode] = useState('');
  const [success, setSuccess] = useState(false);

  const applyCoupon = () => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return;
    setAppliedCoupon({ code: normalized, discountAmount: 0 });
    setSuccess(true);
    setCode('');
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setSuccess(false);
  };

  return (
    <div className="rounded-3xl border border-border/60 bg-surface-elevated p-5 shadow-soft">
      <div className="mb-3 flex items-center gap-2">
        <Tag className="h-4 w-4 text-champagne-dark" />
        <h3 className="text-sm font-medium text-foreground">Coupon Code</h3>
      </div>

      <AnimatePresence mode="wait">
        {appliedCoupon ? (
          <motion.div
            key="applied"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900/50 dark:bg-green-950/30"
          >
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
              <Check className="h-4 w-4" />
              <span className="font-medium">{appliedCoupon.code}</span>
              <span className="text-green-600/80 dark:text-green-500/80">applied at checkout</span>
            </div>
            <button type="button" onClick={removeCoupon} aria-label="Remove coupon">
              <X className="h-4 w-4 text-green-600 dark:text-green-400" />
            </button>
          </motion.div>
        ) : (
          <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
            <Input
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="rounded-2xl"
            />
            <Button type="button" variant="outline" onClick={applyCoupon}>
              Apply
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {success && !appliedCoupon && (
        <p className="mt-2 text-xs text-green-600 dark:text-green-400">Coupon applied.</p>
      )}

      <p className="mt-3 text-xs text-ink-faint">Coupon discounts are validated when you place your order.</p>
    </div>
  );
}
