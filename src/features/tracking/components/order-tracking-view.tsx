'use client';

import { useCallback } from 'react';
import { useOrderTracking } from '@/features/tracking/hooks/use-order-tracking';
import { useShipmentToasts, ShipmentToastStack } from '@/features/tracking/components/shipment-toast';
import { TrackingPageSkeleton } from './tracking-page-skeleton';
import { TrackingErrorState } from './tracking-guard';
import { TrackingHeader } from './tracking-header';
import { CurrentStatusCard } from './current-status-card';
import { TrackingTimeline } from './tracking-timeline';
import { TrackingHistoryList } from './tracking-history-list';
import { ShipmentDetailsCard } from './shipment-details-card';
import { OrderSummaryCard } from './order-summary-card';
import { PaymentInfoCard } from './payment-info-card';
import { DeliveryAddressCard } from './delivery-address-card';
import { ConnectionStatusBadge } from './connection-status-badge';
import type { NotificationRealtimePayload } from '@/features/tracking/types/socket.types';

interface OrderTrackingViewProps {
  orderId: string;
}

export function OrderTrackingView({ orderId }: OrderTrackingViewProps) {
  const { toasts, push, dismiss } = useShipmentToasts();

  const handleNotification = useCallback(
    (notification: NotificationRealtimePayload) => {
      push({
        title: notification.title,
        message: notification.message,
        variant:
          notification.type === 'DELIVERED' || notification.type === 'REFUND_COMPLETED'
            ? 'success'
            : 'info',
      });
    },
    [push],
  );

  const {
    tracking,
    history,
    loading,
    historyLoading,
    error,
    refresh,
    loadMoreHistory,
    hasMoreHistory,
    connectionStatus,
    liveUpdateCount,
  } = useOrderTracking(orderId, handleNotification);

  const handleRefresh = useCallback(async () => {
    await refresh();
  }, [refresh]);

  if (loading) return <TrackingPageSkeleton />;
  if (error || !tracking) {
    return <TrackingErrorState message={error || 'Order not found'} onRetry={handleRefresh} />;
  }

  return (
    <>
      <div className="section-padding pt-8 pb-16">
        <div className="container-premium space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <TrackingHeader tracking={tracking} />
            <ConnectionStatusBadge status={connectionStatus} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
            <div className="space-y-6 lg:col-span-2">
              <CurrentStatusCard
                data={tracking.currentStatus}
                connectionStatus={connectionStatus}
                liveUpdateKey={liveUpdateCount}
              />
              <TrackingTimeline key={`timeline-${liveUpdateCount}`} steps={tracking.timeline} />
              <TrackingHistoryList
                key={`history-${liveUpdateCount}`}
                items={history}
                loading={historyLoading}
                hasMore={hasMoreHistory}
                onLoadMore={loadMoreHistory}
              />
            </div>

            <div className="space-y-4">
              <ShipmentDetailsCard shipment={tracking.shipment} />
              <OrderSummaryCard summary={tracking.summary} />
              <PaymentInfoCard payment={tracking.payment} />
              <DeliveryAddressCard address={tracking.shippingAddress} />
            </div>
          </div>
        </div>
      </div>

      <ShipmentToastStack toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
