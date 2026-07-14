import { CheckoutPage } from '@/features/checkout/components/checkout-page';
import { CheckoutGuard } from '@/features/checkout/components/checkout-guard';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Checkout',
  description: 'Complete your purchase securely.',
  path: '/checkout',
  noIndex: true,
});

export default function CheckoutRoutePage() {
  return (
    <CheckoutGuard>
      <CheckoutPage />
    </CheckoutGuard>
  );
}
