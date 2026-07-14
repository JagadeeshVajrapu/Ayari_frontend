'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Truck } from 'lucide-react';
import { formatPrice } from '@/features/shop/stores/shop.store';
import { getEstimatedDelivery } from '@/features/cart/lib/cart-calculations';
import type { CartTotals } from '@/features/cart/lib/cart-calculations';
import type { ShippingMethod } from '@/features/shop/stores/shop.store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface OrderSummaryProps {
  totals: CartTotals;
  shippingMethod: ShippingMethod;
}

function SummaryRow({
  label,
  value,
  highlight,
  negative,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-muted">{label}</span>
      <span
        className={
          highlight
            ? 'font-semibold text-foreground'
            : negative
              ? 'text-green-600 dark:text-green-400'
              : 'text-foreground'
        }
      >
        {value}
      </span>
    </div>
  );
}

export function OrderSummary({ totals, shippingMethod }: OrderSummaryProps) {
  const delivery = getEstimatedDelivery(shippingMethod);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="sticky top-32 rounded-4xl border border-border/60 bg-surface-elevated p-6 shadow-medium sm:p-8"
    >
      <h2 className="font-display text-xl text-foreground">Order Summary</h2>
      <p className="mt-1 text-xs text-ink-muted">
        {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'}
      </p>

      <div className="mt-6 space-y-3">
        <SummaryRow label="Subtotal" value={formatPrice(totals.subtotal)} />
        {totals.savings > 0 && (
          <SummaryRow label="Product savings" value={`-${formatPrice(totals.savings)}`} negative />
        )}
        {totals.discount > 0 && (
          <SummaryRow label="Coupon discount" value={`-${formatPrice(totals.discount)}`} negative />
        )}
        <SummaryRow
          label="Shipping"
          value={totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}
        />
        <SummaryRow label="Tax (GST 18%)" value={formatPrice(totals.tax)} />
      </div>

      <Separator className="my-5" />

      <div className="flex items-center justify-between">
        <span className="font-display text-lg text-foreground">Total</span>
        <span className="font-display text-2xl text-foreground">{formatPrice(totals.total)}</span>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-2xl bg-muted/50 px-4 py-3">
        <Truck className="h-4 w-4 shrink-0 text-champagne-dark dark:text-champagne" />
        <div>
          <p className="text-xs font-medium text-foreground">Estimated Delivery</p>
          <p className="text-[11px] text-ink-muted">{delivery.label}</p>
        </div>
      </div>

      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="mt-6">
        <Button variant="champagne" size="xl" className="group w-full" asChild>
          <Link href="/checkout">
            <Lock className="h-4 w-4" />
            Proceed to Checkout
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </motion.div>

      <p className="mt-3 text-center text-[10px] text-ink-faint">
        Secure checkout · SSL encrypted
      </p>

      <Button variant="ghost" className="mt-3 w-full" asChild>
        <Link href="/shop">Continue Shopping</Link>
      </Button>
    </motion.div>
  );
}
