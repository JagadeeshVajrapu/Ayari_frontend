'use client';

import { use } from 'react';
import { AdminShipmentDetailView } from '@/features/admin/components/admin-shipment-detail-view';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AdminShipmentDetailView shipmentId={id} />;
}
