'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { trackingService } from '@/services/tracking.service';
import { getApiErrorMessage } from '@/services/auth.service';
import { useShipmentSocket } from '@/features/tracking/hooks/use-shipment-socket';
import type { OrderTracking, TrackingHistoryItem } from '@/features/tracking/types/tracking.types';
import type {
  NotificationRealtimePayload,
  SocketConnectionStatus,
} from '@/features/tracking/types/socket.types';

export function useOrderTracking(
  orderId: string,
  onNotification?: (notification: NotificationRealtimePayload) => void,
) {
  const [tracking, setTracking] = useState<OrderTracking | null>(null);
  const [history, setHistory] = useState<TrackingHistoryItem[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<SocketConnectionStatus>('disconnected');
  const [liveUpdateCount, setLiveUpdateCount] = useState(0);

  const loadTracking = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await trackingService.getOrderTracking(orderId);
      setTracking(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  const loadHistory = useCallback(
    async (page = 1) => {
      if (!tracking?.shipment?.id) return;
      setHistoryLoading(true);
      try {
        const data = await trackingService.getShipmentHistory(tracking.shipment.id, {
          page,
          limit: 10,
        });
        setHistory((prev) => (page === 1 ? data.items : [...prev, ...data.items]));
        setHistoryPage(data.pagination.page);
        setHistoryTotalPages(data.pagination.totalPages);
      } catch {
        // History is supplementary — don't block the page
      } finally {
        setHistoryLoading(false);
      }
    },
    [tracking?.shipment?.id],
  );

  const handleLiveTrackingUpdate = useCallback(
    (data: OrderTracking) => {
      trackingService.invalidateCache(orderId);
      setTracking(data);
      setHistory([]);
      setLiveUpdateCount((c) => c + 1);
    },
    [orderId],
  );

  const handleLiveNotification = useCallback(
    (notification: NotificationRealtimePayload) => {
      onNotification?.(notification);
    },
    [onNotification],
  );

  useEffect(() => {
    loadTracking();
  }, [loadTracking]);

  useEffect(() => {
    if (tracking?.shipment?.id) {
      loadHistory(1);
    }
  }, [tracking?.shipment?.id, loadHistory]);

  useShipmentSocket({
    orderId,
    enabled: Boolean(tracking),
    onTrackingUpdate: handleLiveTrackingUpdate,
    onNotification: handleLiveNotification,
    onConnectionChange: setConnectionStatus,
  });

  const refresh = useCallback(async () => {
    trackingService.invalidateCache(orderId);
    await loadTracking();
  }, [orderId, loadTracking]);

  const loadMoreHistory = useCallback(() => {
    if (historyPage < historyTotalPages && !historyLoading) {
      loadHistory(historyPage + 1);
    }
  }, [historyPage, historyTotalPages, historyLoading, loadHistory]);

  const displayHistory = useMemo(() => {
    if (history.length) return history;
    return (tracking?.timeline ?? [])
      .filter((step) => step.state === 'completed' || step.state === 'current')
      .map((step, index) => ({
        id: `${step.key}-${index}`,
        status: step.key,
        statusLabel: step.label,
        description: step.description,
        location: step.location,
        updatedBy: step.updatedBy,
        eventAt: '',
        date: step.date ?? '',
        time: step.time ?? '',
      }))
      .reverse();
  }, [history, tracking?.timeline]);

  return {
    tracking,
    history: displayHistory,
    loading,
    historyLoading,
    error,
    refresh,
    loadMoreHistory,
    hasMoreHistory: historyPage < historyTotalPages,
    connectionStatus,
    liveUpdateCount,
  };
}
