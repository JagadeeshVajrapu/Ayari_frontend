export const SOCKET_EVENTS = {
  SHIPMENT_CREATED: 'shipment_created',
  SHIPMENT_UPDATED: 'shipment_updated',
  SHIPMENT_CANCELLED: 'shipment_cancelled',
  SHIPMENT_RETURNED: 'shipment_returned',
  SHIPMENT_DELIVERED: 'shipment_delivered',
  TRACKING_HISTORY_ADDED: 'tracking_history_added',
  NOTIFICATION_CREATED: 'notification_created',
  NOTIFICATION_READ: 'notification_read',
  NOTIFICATION_DELETED: 'notification_deleted',
  NOTIFICATION_UPDATED: 'notification_updated',
  CONNECTION_ACK: 'connection_ack',
  SUBSCRIBE_ORDER: 'subscribe_order',
  UNSUBSCRIBE_ORDER: 'unsubscribe_order',
  SUBSCRIBE_ACK: 'subscribe_ack',
  SUBSCRIBE_ERROR: 'subscribe_error',
} as const;

export type SocketConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

export interface ShipmentRealtimePayload {
  orderId: string;
  orderNumber: string;
  shipmentId: string;
  status: string;
  tracking: import('@/features/tracking/types/tracking.types').OrderTracking;
  updatedAt: string;
}

export interface TrackingHistoryPayload {
  orderId: string;
  orderNumber: string;
  shipmentId: string;
  status: string;
  statusLabel: string;
  description: string | null;
  location: string | null;
  eventAt: string;
  tracking: import('@/features/tracking/types/tracking.types').OrderTracking;
}

export interface NotificationRealtimePayload {
  id: string;
  type: string;
  title: string;
  message: string;
  orderId: string | null;
  shipmentId: string | null;
  createdAt: string;
}

export const SHIPMENT_TOAST_MESSAGES: Record<string, string> = {
  PACKED: 'Your order has been packed.',
  PICKED_UP: 'Your order has been picked up.',
  IN_TRANSIT: 'Your order is on the way.',
  REACHED_HUB: 'Your order has reached the sorting hub.',
  OUT_FOR_DELIVERY: 'Your order is out for delivery.',
  DELIVERED: 'Your order has been delivered.',
  CANCELLED: 'Your shipment has been cancelled.',
  RETURNED: 'Your order has been returned.',
  COURIER_ASSIGNED: 'A courier has been assigned to your order.',
  SHIPMENT_CONFIRMED: 'Your shipment has been confirmed.',
};

export function getToastMessage(notification: NotificationRealtimePayload): string {
  if (notification.message) return notification.message;
  return notification.title;
}
