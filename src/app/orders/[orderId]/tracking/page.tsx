import { TrackingGuard } from '@/features/tracking/components/tracking-guard';
import { OrderTrackingView } from '@/features/tracking/components/order-tracking-view';

export const metadata = {
  title: 'Order Tracking — AYARI',
  description: 'Track your AYARI order in real time.',
};

interface OrderTrackingPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderTrackingPage({ params }: OrderTrackingPageProps) {
  const { orderId } = await params;

  return (
    <TrackingGuard>
      <OrderTrackingView orderId={orderId} />
    </TrackingGuard>
  );
}
