import { Suspense } from 'react';
import { CheckoutSuccessPage } from '@/features/checkout/components/checkout-success';

export const metadata = {
  title: 'Order Confirmed — AYARI',
  description: 'Your order has been placed successfully.',
};

export default function CheckoutSuccessRoutePage() {
  return (
    <Suspense fallback={null}>
      <CheckoutSuccessPage />
    </Suspense>
  );
}
