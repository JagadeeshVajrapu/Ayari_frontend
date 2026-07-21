export type TimelineStepState = 'completed' | 'current' | 'upcoming' | 'skipped';

export interface TrackingTimelineStep {
  key: string;
  label: string;
  description: string;
  state: TimelineStepState;
  date: string | null;
  time: string | null;
  location: string | null;
  updatedBy: string | null;
  icon: string;
}

export interface TrackingHistoryItem {
  id: string;
  status: string;
  statusLabel: string;
  description: string | null;
  location: string | null;
  updatedBy: string | null;
  eventAt: string;
  date: string;
  time: string;
}

export interface OrderTrackingAddress {
  recipientName: string;
  phone: string | null;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderTrackingPayment {
  method: string;
  methodLabel: string;
  status: string;
  statusLabel: string;
  transactionId: string | null;
  paidAmount: number;
  paymentDate: string | null;
}

export interface OrderTrackingItem {
  id: string;
  productName: string;
  productSku: string;
  variantId?: string | null;
  variantName?: string | null;
  variantImageUrl?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderTrackingSummary {
  items: OrderTrackingItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shippingCharges: number;
  grandTotal: number;
}

export interface ShipmentTrackingDetails {
  id: string;
  shipmentNumber: string;
  courierPartner: string;
  trackingNumber: string;
  trackingUrl: string | null;
  packageWeight: string | null;
  packageDimensions: string | null;
  estimatedDelivery: string;
  shippingMethod: string;
  warehouse: string | null;
  status: string;
  statusLabel: string;
}

export interface CurrentStatusCard {
  orderNumber: string;
  currentStatus: string;
  statusDescription: string;
  estimatedDelivery: string | null;
  lastUpdated: string | null;
  currentLocation: string | null;
  progressPercent: number;
}

export interface OrderTracking {
  orderId: string;
  orderNumber: string;
  orderDate: string;
  estimatedDelivery: string | null;
  orderStatus: string;
  orderStatusLabel: string;
  paymentStatus: string;
  paymentStatusLabel: string;
  shipmentStatus: string | null;
  shipmentStatusLabel: string | null;
  courierPartner: string | null;
  trackingNumber: string | null;
  deliveryInstructions: string | null;
  customerName: string;
  customerPhone: string | null;
  shippingAddress: OrderTrackingAddress;
  currentStatus: CurrentStatusCard;
  shipment: ShipmentTrackingDetails | null;
  summary: OrderTrackingSummary;
  payment: OrderTrackingPayment;
  timeline: TrackingTimelineStep[];
}

export interface TrackingHistoryResponse {
  items: TrackingHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
