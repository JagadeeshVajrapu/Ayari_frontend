'use client';

import { memo } from 'react';
import type { OrderTrackingSummary } from '@/features/tracking/types/tracking.types';
import { formatPrice } from '@/features/shop/stores/shop.store';
import { InfoCard } from './info-card';

interface OrderSummaryCardProps {
  summary: OrderTrackingSummary;
}

export const OrderSummaryCard = memo(function OrderSummaryCard({ summary }: OrderSummaryCardProps) {
  return (
    <InfoCard title="Order Summary">
      <div className="space-y-3">
        {summary.items.map((item) => (
          <div key={item.id} className="flex justify-between gap-3 text-sm">
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{item.productName}</p>
              <p className="text-xs text-ink-muted">Qty {item.quantity}</p>
            </div>
            <p className="shrink-0 font-medium">{formatPrice(item.totalPrice)}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2 border-t border-border/60 pt-4 text-sm">
        <div className="flex justify-between text-ink-muted">
          <span>Subtotal</span>
          <span>{formatPrice(summary.subtotal)}</span>
        </div>
        {summary.discount > 0 && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <span>Discount</span>
            <span>-{formatPrice(summary.discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-ink-muted">
          <span>Tax</span>
          <span>{formatPrice(summary.tax)}</span>
        </div>
        <div className="flex justify-between text-ink-muted">
          <span>Shipping</span>
          <span>{formatPrice(summary.shippingCharges)}</span>
        </div>
        <div className="flex justify-between border-t border-border/60 pt-2 font-display text-lg text-foreground">
          <span>Grand Total</span>
          <span>{formatPrice(summary.grandTotal)}</span>
        </div>
      </div>
    </InfoCard>
  );
});
