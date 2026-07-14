import { CartPage } from '@/features/cart/components/cart-page';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Shopping Bag',
  description: 'Review your cart and proceed to checkout.',
  path: '/cart',
  noIndex: true,
});

export default function CartRoutePage() {
  return <CartPage />;
}
