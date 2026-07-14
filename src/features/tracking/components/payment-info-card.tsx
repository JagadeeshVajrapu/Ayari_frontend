'use client';

import { memo } from 'react';
import type { OrderTrackingPayment } from '@/features/tracking/types/tracking.types';
import { formatPrice } from '@/features/shop/stores/shop.store';
import { formatTrackingDate, getStatusBadgeClass } from '@/features/tracking/lib/tracking-constants';
import { InfoCard } from './info-card';

interface PaymentInfoCardProps {
  payment: OrderTrackingPayment;
}

export const PaymentInfoCard = memo(function PaymentInfoCard({ payment }: PaymentInfoCardProps) {
  return (
    <InfoCard title="Payment Information">
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">Payment Method</dt>
          <dd className="font-medium text-foreground">{payment.methodLabel}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">Payment Status</dt>
          <dd>
            <span
              className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(payment.statusLabel)}`}
            >
              {payment.statusLabel}
            </span>
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">Transaction ID</dt>
          <dd className="max-w-[50%] truncate font-medium text-foreground">
            {payment.transactionId ?? '—'}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">Paid Amount</dt>
          <dd className="font-medium text-foreground">{formatPrice(payment.paidAmount)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">Payment Date</dt>
          <dd className="font-medium text-foreground">
            {formatTrackingDate(payment.paymentDate)}
          </dd>
        </div>
      </dl>
    </InfoCard>
  );
});
