import { api } from '@/services/auth.service';

export type NotificationCategory =
  | 'ORDER'
  | 'PAYMENT'
  | 'SHIPMENT'
  | 'DELIVERY'
  | 'RETURN'
  | 'REFUND'
  | 'COUPON'
  | 'WISHLIST'
  | 'OFFER'
  | 'ACCOUNT'
  | 'SECURITY'
  | 'SYSTEM';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  category: NotificationCategory;
  status: string;
  priority: string;
  icon: string | null;
  actionUrl: string | null;
  metadata: Record<string, unknown> | null;
  isRead: boolean;
  readAt: string | null;
  orderId: string | null;
  shipmentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResponse {
  items: Notification[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  unreadCount: number;
}

export interface AdminNotificationStats {
  total: number;
  unread: number;
  sentToday: number;
  emailSuccess: number;
  emailFailed: number;
  topTypes: Array<{ type: string; count: number }>;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const notificationApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: NotificationCategory;
    unreadOnly?: boolean;
  }) =>
    api
      .get<ApiResponse<NotificationListResponse>>('/notifications', { params })
      .then((r) => r.data.data),

  getUnreadCount: () =>
    api
      .get<ApiResponse<{ unreadCount: number }>>('/notifications/unread-count')
      .then((r) => r.data.data.unreadCount),

  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),

  markAllAsRead: () => api.patch('/notifications/read-all'),

  delete: (id: string) => api.delete(`/notifications/${id}`),

  getAdminDashboard: () =>
    api
      .get<ApiResponse<{ stats: AdminNotificationStats }>>('/admin/notifications/dashboard')
      .then((r) => r.data.data.stats),

  broadcast: (data: { title: string; message: string; actionUrl?: string; userIds?: string[] }) =>
    api.post('/admin/notifications/broadcast', data),
};

export const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  ORDER: 'Orders',
  PAYMENT: 'Payments',
  SHIPMENT: 'Shipments',
  DELIVERY: 'Delivery',
  RETURN: 'Returns',
  REFUND: 'Refunds',
  COUPON: 'Coupons',
  WISHLIST: 'Wishlist',
  OFFER: 'Offers',
  ACCOUNT: 'Account',
  SECURITY: 'Security',
  SYSTEM: 'System',
};

export const CATEGORY_COLORS: Record<NotificationCategory, string> = {
  ORDER: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  PAYMENT: 'bg-green-500/15 text-green-600 dark:text-green-400',
  SHIPMENT: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  DELIVERY: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  RETURN: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  REFUND: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  COUPON: 'bg-champagne/20 text-champagne-dark dark:text-champagne',
  WISHLIST: 'bg-pink-500/15 text-pink-600 dark:text-pink-400',
  OFFER: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
  ACCOUNT: 'bg-muted text-muted-foreground',
  SECURITY: 'bg-red-500/15 text-red-600 dark:text-red-400',
  SYSTEM: 'bg-slate-500/15 text-slate-600 dark:text-slate-400',
};
