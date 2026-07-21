import { api } from '@/services/auth.service';
import type { CheckoutFormData } from '@/features/checkout/schemas/checkout.schema';
import type { ShippingMethod } from '@/features/shop/stores/shop.store';

export interface CheckoutLineItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface CreatePaymentOrderPayload {
  items: CheckoutLineItem[];
  shipping: CheckoutFormData['shipping'];
  paymentMethod: CheckoutFormData['paymentMethod'];
  shippingMethod: ShippingMethod;
  orderNotes?: string;
  couponCode?: string;
}

export interface RazorpayOrderResponse {
  orderId: string;
  orderNumber: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  mock?: boolean;
  total: number;
}

export interface VerifyPaymentPayload {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  orderId: string;
}

export interface CheckoutOrderResponse {
  orderId: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  total: number;
}

export const checkoutService = {
  createRazorpayOrder: (payload: CreatePaymentOrderPayload) =>
    api.post<{ success: boolean; data: RazorpayOrderResponse }>(
      '/payments/razorpay/create-order',
      payload,
    ),

  verifyRazorpayPayment: (payload: VerifyPaymentPayload) =>
    api.post<{ success: boolean; data: CheckoutOrderResponse }>(
      '/payments/razorpay/verify',
      payload,
    ),

  placeCodOrder: (payload: CreatePaymentOrderPayload) =>
    api.post<{ success: boolean; data: CheckoutOrderResponse }>(
      '/payments/cod/place-order',
      payload,
    ),

  getOrder: (orderId: string) =>
    api.get<{ success: boolean; data: CheckoutOrderResponse }>(
      `/payments/orders/${orderId}`,
    ),
};

export function getCheckoutErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}
