import { Suspense } from 'react';
import { CheckoutFailedPage } from '@/features/checkout/components/checkout-failed';

export const metadata = {
  title: 'Payment Failed — AYARI',
  description: 'Your payment could not be completed.',
};

export default function CheckoutFailedRoutePage() {
  return (
    <Suspense fallback={null}>
      <CheckoutFailedPage />
    </Suspense>
  );
}
