'use client';

import { memo } from 'react';
import type { ShipmentTrackingDetails } from '@/features/tracking/types/tracking.types';
import { formatTrackingDate } from '@/features/tracking/lib/tracking-constants';
import { InfoCard } from './info-card';

interface ShipmentDetailsCardProps {
  shipment: ShipmentTrackingDetails | null;
}

export const ShipmentDetailsCard = memo(function ShipmentDetailsCard({
  shipment,
}: ShipmentDetailsCardProps) {
  if (!shipment) {
    return (
      <InfoCard title="Shipment Details">
        <p className="text-sm text-ink-muted">Shipment will be created after payment confirmation.</p>
      </InfoCard>
    );
  }

  const rows = [
    { label: 'Courier Partner', value: shipment.courierPartner },
    { label: 'Tracking Number', value: shipment.trackingNumber },
    { label: 'Shipment Number', value: shipment.shipmentNumber },
    { label: 'Package Weight', value: shipment.packageWeight ?? '—' },
    { label: 'Package Dimensions', value: shipment.packageDimensions ?? '—' },
    { label: 'Estimated Delivery', value: formatTrackingDate(shipment.estimatedDelivery) },
    { label: 'Shipping Method', value: shipment.shippingMethod },
    { label: 'Warehouse', value: shipment.warehouse ?? '—' },
  ];

  return (
    <InfoCard title="Shipment Details">
      <dl className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4 text-sm">
            <dt className="text-ink-muted">{row.label}</dt>
            <dd className="text-right font-medium text-foreground">
              {row.label === 'Tracking Number' && shipment.trackingUrl ? (
                <a
                  href={shipment.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  {row.value}
                </a>
              ) : (
                row.value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </InfoCard>
  );
});
