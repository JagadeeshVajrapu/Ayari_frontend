'use client';

import { memo } from 'react';
import type { OrderTrackingAddress } from '@/features/tracking/types/tracking.types';
import { InfoCard } from './info-card';

interface DeliveryAddressCardProps {
  address: OrderTrackingAddress;
}

export const DeliveryAddressCard = memo(function DeliveryAddressCard({
  address,
}: DeliveryAddressCardProps) {
  return (
    <InfoCard title="Delivery Address">
      <div className="space-y-1 text-sm">
        <p className="font-medium text-foreground">{address.recipientName}</p>
        {address.phone && <p className="text-ink-muted">{address.phone}</p>}
        <p className="text-ink-muted">{address.street}</p>
        <p className="text-ink-muted">
          {address.city}, {address.state} {address.postalCode}
        </p>
        <p className="text-ink-muted">{address.country}</p>
      </div>
    </InfoCard>
  );
});
