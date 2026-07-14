'use client';

import { memo } from 'react';
import Link from 'next/link';
import { ChevronLeft, MapPin, Phone, User } from 'lucide-react';
import type { OrderTracking } from '@/features/tracking/types/tracking.types';
import { formatTrackingDate, getStatusBadgeClass } from '@/features/tracking/lib/tracking-constants';

interface TrackingHeaderProps {
  tracking: OrderTracking;
}

export const TrackingHeader = memo(function TrackingHeader({ tracking }: TrackingHeaderProps) {
  return (
    <div className="space-y-4">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1 text-sm text-ink-muted transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Orders
      </Link>

      <div className="rounded-3xl border border-border/60 bg-surface-elevated p-6 shadow-soft sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs tracking-wider text-ink-faint uppercase">Order Tracking</p>
            <h1 className="font-display text-display-md text-foreground">{tracking.orderNumber}</h1>
            <p className="mt-2 text-sm text-ink-muted">
              Ordered on {formatTrackingDate(tracking.orderDate)}
              {tracking.estimatedDelivery && (
                <> · Est. delivery {formatTrackingDate(tracking.estimatedDelivery)}</>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusBadgeClass(tracking.paymentStatusLabel)}`}
            >
              {tracking.paymentStatusLabel}
            </span>
            {tracking.shipmentStatusLabel && (
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusBadgeClass(tracking.shipmentStatusLabel)}`}
              >
                {tracking.shipmentStatusLabel}
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-muted/40 p-4">
            <p className="text-xs text-ink-muted">Courier Partner</p>
            <p className="mt-1 font-medium">{tracking.courierPartner ?? '—'}</p>
          </div>
          <div className="rounded-2xl bg-muted/40 p-4">
            <p className="text-xs text-ink-muted">Tracking Number</p>
            <p className="mt-1 font-medium">{tracking.trackingNumber ?? '—'}</p>
          </div>
          <div className="rounded-2xl bg-muted/40 p-4">
            <p className="flex items-center gap-1.5 text-xs text-ink-muted">
              <User className="h-3.5 w-3.5" /> Customer
            </p>
            <p className="mt-1 font-medium">{tracking.customerName}</p>
          </div>
          <div className="rounded-2xl bg-muted/40 p-4">
            <p className="flex items-center gap-1.5 text-xs text-ink-muted">
              <Phone className="h-3.5 w-3.5" /> Phone
            </p>
            <p className="mt-1 font-medium">{tracking.customerPhone ?? '—'}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl bg-muted/40 p-4">
            <p className="flex items-center gap-1.5 text-xs text-ink-muted">
              <MapPin className="h-3.5 w-3.5" /> Shipping Address
            </p>
            <p className="mt-1 text-sm text-foreground">
              {tracking.shippingAddress.street}, {tracking.shippingAddress.city},{' '}
              {tracking.shippingAddress.state} {tracking.shippingAddress.postalCode}
            </p>
          </div>
          {tracking.deliveryInstructions && (
            <div className="rounded-2xl bg-muted/40 p-4">
              <p className="text-xs text-ink-muted">Delivery Instructions</p>
              <p className="mt-1 text-sm text-foreground">{tracking.deliveryInstructions}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
