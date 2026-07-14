'use client';

import { useEffect, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import {
  getShipmentSocket,
  refreshSocketAuth,
  subscribeToOrder,
  unsubscribeFromOrder,
  SOCKET_EVENTS,
} from '@/services/socket.service';
import type {
  NotificationRealtimePayload,
  ShipmentRealtimePayload,
  SocketConnectionStatus,
  TrackingHistoryPayload,
} from '@/features/tracking/types/socket.types';
import type { OrderTracking } from '@/features/tracking/types/tracking.types';
import { useAuthStore } from '@/features/auth/stores/auth.store';

interface UseShipmentSocketOptions {
  orderId: string;
  enabled?: boolean;
  onTrackingUpdate: (tracking: OrderTracking) => void;
  onNotification?: (notification: NotificationRealtimePayload) => void;
  onConnectionChange?: (status: SocketConnectionStatus) => void;
}

const SHIPMENT_EVENTS = [
  SOCKET_EVENTS.SHIPMENT_CREATED,
  SOCKET_EVENTS.SHIPMENT_UPDATED,
  SOCKET_EVENTS.SHIPMENT_CANCELLED,
  SOCKET_EVENTS.SHIPMENT_RETURNED,
  SOCKET_EVENTS.SHIPMENT_DELIVERED,
  SOCKET_EVENTS.TRACKING_HISTORY_ADDED,
] as const;

function applyTrackingPayload(
  payload: ShipmentRealtimePayload | TrackingHistoryPayload,
  onTrackingUpdate: (tracking: OrderTracking) => void,
) {
  if (payload.tracking) {
    onTrackingUpdate(payload.tracking);
  }
}

export function useShipmentSocket({
  orderId,
  enabled = true,
  onTrackingUpdate,
  onNotification,
  onConnectionChange,
}: UseShipmentSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const subscribedRef = useRef(false);
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!enabled || !orderId || !accessToken) {
      onConnectionChange?.('disconnected');
      return;
    }

    refreshSocketAuth();
    const socket = getShipmentSocket();
    socketRef.current = socket;

    const setStatus = (status: SocketConnectionStatus) => onConnectionChange?.(status);

    const handleShipmentEvent = (payload: ShipmentRealtimePayload | TrackingHistoryPayload) => {
      if (payload.orderId !== orderId) return;
      applyTrackingPayload(payload, onTrackingUpdate);
    };

    const handleNotification = (payload: NotificationRealtimePayload) => {
      if (payload.orderId && payload.orderId !== orderId) return;
      onNotification?.(payload);
    };

    const subscribe = () => {
      if (!subscribedRef.current) {
        subscribeToOrder(socket, orderId);
        subscribedRef.current = true;
      }
    };

    socket.on('connect', () => {
      setStatus('connected');
      subscribe();
    });

    socket.on('disconnect', () => setStatus('disconnected'));
    socket.on('connect_error', () => setStatus('error'));
    socket.io.on('reconnect_attempt', () => setStatus('reconnecting'));
    socket.io.on('reconnect', () => {
      setStatus('connected');
      subscribedRef.current = false;
      subscribe();
    });

    socket.on(SOCKET_EVENTS.SUBSCRIBE_ACK, () => setStatus('connected'));
    socket.on(SOCKET_EVENTS.SUBSCRIBE_ERROR, () => setStatus('error'));

    for (const event of SHIPMENT_EVENTS) {
      socket.on(event, handleShipmentEvent);
    }
    socket.on(SOCKET_EVENTS.NOTIFICATION_CREATED, handleNotification);

    setStatus('connecting');
    if (!socket.connected) {
      socket.connect();
    } else {
      subscribe();
    }

    return () => {
      if (subscribedRef.current) {
        unsubscribeFromOrder(socket, orderId);
        subscribedRef.current = false;
      }

      for (const event of SHIPMENT_EVENTS) {
        socket.off(event, handleShipmentEvent);
      }
      socket.off(SOCKET_EVENTS.NOTIFICATION_CREATED, handleNotification);
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.io.off('reconnect_attempt');
      socket.io.off('reconnect');
      socket.off(SOCKET_EVENTS.SUBSCRIBE_ACK);
      socket.off(SOCKET_EVENTS.SUBSCRIBE_ERROR);
    };
  }, [orderId, enabled, accessToken, onTrackingUpdate, onNotification, onConnectionChange]);
}
