'use client';

import { useEffect, useState } from 'react';
import { Gift, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useShopStore } from '@/features/shop/stores/shop.store';

const STORAGE_KEY = 'ayari-welcome-coupon-dismissed';
const COUPON_CODE = 'AYARI10';

export function WelcomeCouponModal() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const setAppliedCoupon = useShopStore((s) => s.setAppliedCoupon);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      if (window.localStorage.getItem(STORAGE_KEY) === '1') return;
      const timer = window.setTimeout(() => setOpen(true), 1200);
      return () => window.clearTimeout(timer);
    } catch {
      // ignore storage access issues
    }
  }, []);

  const dismiss = () => {
    setOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(COUPON_CODE);
    } catch {
      const input = document.createElement('input');
      input.value = COUPON_CODE;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setAppliedCoupon({ code: COUPON_CODE, discountAmount: 0 });
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/55 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-coupon-title"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative w-full max-w-md rounded-3xl border border-border/70 bg-cream px-6 py-8 text-center shadow-premium dark:bg-surface-elevated sm:px-8"
          >
            <button
              type="button"
              onClick={dismiss}
              className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-champagne/25 text-champagne-dark">
              <Gift className="h-5 w-5" />
            </div>

            <p className="mt-5 text-[11px] font-semibold tracking-[0.22em] text-champagne-dark uppercase">
              Welcome to the Atelier
            </p>
            <h2
              id="welcome-coupon-title"
              className="mt-3 font-display text-3xl leading-tight text-foreground sm:text-[2rem]"
            >
              Get 10% Off Your First Handcraft
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              Unlock first-order savings on candles, keychains, wall decor, and curated gift pieces
              across the Ayari collection.
            </p>

            <div className="mt-6 rounded-2xl border border-border/70 bg-background/80 px-4 py-4 text-left">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-ink-faint uppercase">
                Ayari coupon code
              </p>
              <div className="mt-2 flex items-center gap-3">
                <p className="flex-1 text-2xl font-semibold tracking-wide text-foreground">
                  {COUPON_CODE}
                </p>
                <Button
                  type="button"
                  size="sm"
                  className={cn('min-w-[7.5rem]', copied && 'bg-green-700 text-cream')}
                  onClick={copyCode}
                >
                  {copied ? 'Copied' : 'Copy Code'}
                </Button>
              </div>
            </div>

            <button
              type="button"
              onClick={dismiss}
              className="mt-5 text-sm text-champagne-dark underline underline-offset-4 transition-colors hover:text-foreground"
            >
              No thank you, I prefer standard pricing
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
