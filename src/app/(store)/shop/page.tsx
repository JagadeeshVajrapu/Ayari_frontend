import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { ProductGridSkeleton } from '@/features/shop/components/product-skeleton';
import { createPageMetadata } from '@/lib/seo';

const ProductListing = dynamic(
  () => import('@/features/shop/components/product-listing').then((m) => m.ProductListing),
  { loading: () => <ShopLoading /> },
);

export const metadata = createPageMetadata({
  title: 'Shop',
  description: 'Browse our curated collection of premium fashion, accessories, and footwear.',
  path: '/shop',
});

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopLoading />}>
      <ProductListing />
    </Suspense>
  );
}

function ShopLoading() {
  return (
    <div className="section-padding pt-8" aria-busy="true" aria-label="Loading products">
      <div className="container-premium">
        <div className="mb-10 h-16 animate-pulse rounded-2xl bg-muted" />
        <ProductGridSkeleton count={12} />
      </div>
    </div>
  );
}
