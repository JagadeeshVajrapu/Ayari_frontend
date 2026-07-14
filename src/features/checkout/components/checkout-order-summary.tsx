'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Loader2, Lock, Truck } from 'lucide-react';
import { formatPrice } from '@/features/shop/stores/shop.store';
import { getEstimatedDelivery } from '@/features/cart/lib/cart-calculations';
import type { CartLineItem, CartTotals } from '@/features/cart/lib/cart-calculations';
import type { ShippingMethod } from '@/features/shop/stores/shop.store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface CheckoutOrderSummaryProps {
  lineItems: CartLineItem[];
  totals: CartTotals;
  shippingMethod: ShippingMethod;
  isSubmitting: boolean;
  paymentMethod?: 'razorpay' | 'cod';
}

function SummaryRow({
  label,
  value,
  negative,
}: {
  label: string;
  value: string;
  negative?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-muted">{label}</span>
      <span className={negative ? 'text-green-600 dark:text-green-400' : 'text-foreground'}>
        {value}
      </span>
    </div>
  );
}

export function CheckoutOrderSummary({
  lineItems,
  totals,
  shippingMethod,
  isSubmitting,
  paymentMethod = 'razorpay',
}: CheckoutOrderSummaryProps) {
  const delivery = getEstimatedDelivery(shippingMethod);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-32 rounded-4xl border border-border/60 bg-surface-elevated p-6 shadow-medium sm:p-8"
    >
      <h2 className="font-display text-xl text-foreground">Order Summary</h2>
      <p className="mt-1 text-xs text-ink-muted">
        {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'}
      </p>

      <ul className="mt-5 max-h-64 space-y-3 overflow-y-auto pr-1">
        {lineItems.map((item) => (
          <li key={item.product.id} className="flex gap-3">
            <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl">
              <Image
                src={item.product.image}
                alt={item.product.name}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{item.product.name}</p>
              <p className="text-xs text-ink-muted">
                Qty {item.quantity} · {formatPrice(item.product.price)}
              </p>
            </div>
            <p className="shrink-0 text-sm font-medium">{formatPrice(item.lineTotal)}</p>
          </li>
        ))}
      </ul>

      <Separator className="my-5" />

      <div className="space-y-2.5">
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

      <Button
        type="submit"
        variant="champagne"
        size="xl"
        className="mt-6 w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : paymentMethod === 'cod' ? (
          <>
            <Lock className="h-4 w-4" />
            Place Order · {formatPrice(totals.total)}
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            Pay {formatPrice(totals.total)}
          </>
        )}
      </Button>

      <p className="mt-3 text-center text-[10px] text-ink-faint">
        Secure checkout · SSL encrypted
      </p>
    </motion.div>
  );
}
