import { api } from '@/services/auth.service';
import type { Pagination } from '@/services/admin.service';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type ShipmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PACKING'
  | 'PACKED'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'REACHED_HUB'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export type ShipmentNoteType =
  | 'GENERAL'
  | 'SPECIAL_INSTRUCTIONS'
  | 'PACKAGE_DAMAGED'
  | 'CUSTOMER_DELAY'
  | 'ADDRESS_UPDATED'
  | 'DELIVERY_FAILED';

export type AdminShipmentAction =
  | 'ACCEPT_ORDER'
  | 'REJECT_ORDER'
  | 'START_PACKING'
  | 'MARK_PACKED'
  | 'READY_FOR_PICKUP'
  | 'ASSIGN_COURIER'
  | 'GENERATE_TRACKING'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'REACHED_HUB'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCEL'
  | 'RETURN'
  | 'APPROVE_RETURN'
  | 'REJECT_RETURN'
  | 'INITIATE_REFUND'
  | 'COMPLETE_REFUND';

export interface ShipmentDashboardStats {
  total: number;
  pending: number;
  confirmed: number;
  packing: number;
  packed: number;
  readyForPickup: number;
  pickedUp: number;
  inTransit: number;
  reachedHub: number;
  outForDelivery: number;
  delivered: number;
  cancelled: number;
  returned: number;
  refundPending: number;
  refundCompleted: number;
}

export interface ShipmentListItem {
  id: string;
  shipmentNumber: string;
  orderId: string;
  orderNumber: string;
  courierName: string;
  courierPartnerId: string;
  trackingNumber: string;
  estimatedDelivery: string;
  status: ShipmentStatus;
  customerName: string;
  customerPhone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CourierPartner {
  id: string;
  name: string;
  code: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logoUrl: string | null;
  trackingUrlTemplate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentStatusHistory {
  id: string;
  status: ShipmentStatus;
  note: string | null;
  location: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface ShipmentTrackingEvent {
  id: string;
  status: ShipmentStatus;
  location: string | null;
  description: string | null;
  eventAt: string;
  createdAt: string;
}

export interface AdminShipmentDetail {
  id: string;
  shipmentNumber: string;
  orderId: string;
  orderNumber: string;
  courierPartnerId: string;
  courierName: string;
  trackingNumber: string;
  trackingUrl: string | null;
  estimatedDelivery: string;
  status: ShipmentStatus;
  shippingMethod: string;
  warehouse: string | null;
  packageWeight: string | null;
  packageDimensions: string | null;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  order: {
    status: string;
    placedAt: string | null;
    subtotal: number;
    discount: number;
    tax: number;
    shippingCharges: number;
    total: number;
    notes: string | null;
    items: Array<{
      id: string;
      productName: string;
      productSku: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
    payment: {
      method: string;
      status: string;
      transactionId: string | null;
      amount: number;
      paidAt: string | null;
    } | null;
  };
  notes: Array<{
    id: string;
    type: string;
    content: string;
    createdBy: string | null;
    createdByLabel: string | null;
    createdAt: string;
  }>;
  deliveryAttempts: Array<{
    id: string;
    attemptAt: string;
    status: string;
    reason: string | null;
    location: string | null;
  }>;
  statusHistory?: ShipmentStatusHistory[];
  trackingEvents?: ShipmentTrackingEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ShipmentStatus;
  courierPartnerId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'estimatedDelivery' | 'status' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PACKING: 'Packing',
  PACKED: 'Packed',
  READY_FOR_PICKUP: 'Ready For Pickup',
  PICKED_UP: 'Picked Up',
  IN_TRANSIT: 'In Transit',
  REACHED_HUB: 'Reached Hub',
  OUT_FOR_DELIVERY: 'Out For Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  RETURNED: 'Returned',
};

export const SHIPMENT_STATUS_COLORS: Record<ShipmentStatus, string> = {
  PENDING: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  CONFIRMED: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  PACKING: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
  PACKED: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  READY_FOR_PICKUP: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  PICKED_UP: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
  IN_TRANSIT: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  REACHED_HUB: 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
  OUT_FOR_DELIVERY: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  DELIVERED: 'bg-green-500/15 text-green-600 dark:text-green-400',
  CANCELLED: 'bg-red-500/15 text-red-600 dark:text-red-400',
  RETURNED: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
};

export const ADMIN_ACTION_LABELS: Record<AdminShipmentAction, string> = {
  ACCEPT_ORDER: 'Accept Order',
  REJECT_ORDER: 'Reject Order',
  START_PACKING: 'Start Packing',
  MARK_PACKED: 'Mark Packed',
  READY_FOR_PICKUP: 'Ready For Pickup',
  ASSIGN_COURIER: 'Assign Courier',
  GENERATE_TRACKING: 'Generate Tracking',
  PICKED_UP: 'Picked Up',
  IN_TRANSIT: 'In Transit',
  REACHED_HUB: 'Reached Hub',
  OUT_FOR_DELIVERY: 'Out For Delivery',
  DELIVERED: 'Delivered',
  CANCEL: 'Cancel Shipment',
  RETURN: 'Return Shipment',
  APPROVE_RETURN: 'Approve Return',
  REJECT_RETURN: 'Reject Return',
  INITIATE_REFUND: 'Initiate Refund',
  COMPLETE_REFUND: 'Complete Refund',
};

export const shipmentAdminService = {
  getDashboard: () =>
    api
      .get<ApiResponse<{ stats: ShipmentDashboardStats }>>('/admin/shipments/dashboard')
      .then((res) => res.data.data.stats),

  getShipments: (params?: ShipmentListParams) =>
    api
      .get<ApiResponse<{ items: ShipmentListItem[]; pagination: Pagination }>>('/admin/shipments', {
        params,
      })
      .then((res) => res.data.data),

  getShipment: (id: string) =>
    api
      .get<ApiResponse<{ shipment: AdminShipmentDetail }>>(`/admin/shipments/${id}`)
      .then((res) => res.data.data.shipment),

  updateStatus: (
    id: string,
    data: { status: ShipmentStatus; note?: string; location?: string; warehouse?: string },
  ) =>
    api
      .patch<ApiResponse<{ shipment: AdminShipmentDetail }>>(`/admin/shipments/${id}/status`, data)
      .then((res) => res.data.data.shipment),

  performAction: (
    id: string,
    data: {
      action: AdminShipmentAction;
      courierPartnerId?: string;
      note?: string;
      location?: string;
    },
  ) =>
    api
      .post<ApiResponse<{ shipment: AdminShipmentDetail }>>(`/admin/shipments/${id}/actions`, data)
      .then((res) => res.data.data.shipment),

  assignCourier: (id: string, data: { courierPartnerId: string; location?: string }) =>
    api
      .post<ApiResponse<{ shipment: AdminShipmentDetail }>>(`/admin/shipments/${id}/assign-courier`, data)
      .then((res) => res.data.data.shipment),

  generateTracking: (id: string) =>
    api
      .post<ApiResponse<{ shipment: AdminShipmentDetail }>>(`/admin/shipments/${id}/generate-tracking`)
      .then((res) => res.data.data.shipment),

  addNote: (id: string, data: { type?: ShipmentNoteType; content: string }) =>
    api
      .post<ApiResponse<{ shipment: AdminShipmentDetail }>>(`/admin/shipments/${id}/notes`, data)
      .then((res) => res.data.data.shipment),

  getCouriers: () =>
    api
      .get<ApiResponse<{ couriers: CourierPartner[] }>>('/admin/couriers')
      .then((res) => res.data.data.couriers),

  createCourier: (data: {
    name: string;
    code: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    website?: string;
    logoUrl?: string;
    trackingUrlTemplate?: string;
    isActive?: boolean;
  }) =>
    api
      .post<ApiResponse<{ courier: CourierPartner }>>('/admin/couriers', data)
      .then((res) => res.data.data.courier),

  updateCourier: (
    id: string,
    data: Partial<{
      name: string;
      code: string;
      contactPerson: string;
      phone: string;
      email: string;
      website: string;
      logoUrl: string;
      trackingUrlTemplate: string;
      isActive: boolean;
    }>,
  ) =>
    api
      .put<ApiResponse<{ courier: CourierPartner }>>(`/admin/couriers/${id}`, data)
      .then((res) => res.data.data.courier),

  deleteCourier: (id: string) => api.delete(`/admin/couriers/${id}`),
};
