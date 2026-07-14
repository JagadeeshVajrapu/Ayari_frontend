import { api } from '@/services/auth.service';
import type { OrderTracking, TrackingHistoryResponse } from '@/features/tracking/types/tracking.types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const cache = new Map<string, { data: OrderTracking; expiresAt: number }>();
const CACHE_TTL_MS = 60_000;

export const trackingService = {
  getOrderTracking: async (orderId: string, options?: { skipCache?: boolean }) => {
    const cacheKey = `tracking:${orderId}`;
    const cached = cache.get(cacheKey);
    if (!options?.skipCache && cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const { data } = await api.get<ApiResponse<{ tracking: OrderTracking }>>(
      `/orders/${orderId}/tracking`,
    );

    cache.set(cacheKey, { data: data.data.tracking, expiresAt: Date.now() + CACHE_TTL_MS });
    return data.data.tracking;
  },

  getShipmentHistory: (shipmentId: string, params?: { page?: number; limit?: number }) =>
    api
      .get<ApiResponse<TrackingHistoryResponse>>(`/shipments/${shipmentId}/history`, { params })
      .then((res) => res.data.data),

  getOrderStatusHistory: (orderId: string, params?: { page?: number; limit?: number }) =>
    api
      .get<ApiResponse<TrackingHistoryResponse>>(`/orders/${orderId}/status-history`, { params })
      .then((res) => res.data.data),

  invalidateCache: (orderId: string) => {
    cache.delete(`tracking:${orderId}`);
  },
};
