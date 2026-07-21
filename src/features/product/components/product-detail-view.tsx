'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { ProductGallery } from './product-gallery';
import { ProductBuyBox } from './product-buy-box';
import { DeliveryChecker } from './delivery-checker';
import { ProductSpecifications } from './product-specifications';
import { ProductReviews } from './product-reviews';
import { RelatedProducts } from './related-products';
import { FrequentlyBoughtTogether } from './frequently-bought-together';
import { StickyBuyBox } from './sticky-buy-box';
import { useProductVariations } from '@/features/product/hooks/use-product-variations';
import { Separator } from '@/components/ui/separator';
import type { ListingProduct } from '@/types/product.types';
import type { ProductReview } from '@/types/product.types';

interface ProductDetailViewProps {
  product: ListingProduct;
  relatedProducts: ListingProduct[];
  bundleProducts: ListingProduct[];
  reviews: ProductReview[];
}

export function ProductDetailView({
  product,
  relatedProducts,
  bundleProducts,
  reviews,
}: ProductDetailViewProps) {
  const variation = useProductVariations(product);

  return (
    <div className="pb-24 lg:pb-16">
      <div className="container-premium pt-6">
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 flex flex-wrap items-center gap-1 text-xs text-ink-muted"
        >
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/shop" className="transition-colors hover:text-foreground">
            Shop
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link
            href={`/shop?categories=${encodeURIComponent(product.category)}`}
            className="transition-colors hover:text-foreground"
          >
            {product.category}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{product.name}</span>
        </motion.nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <ProductGallery
              images={variation.galleryImages}
              featuredImages={
                product.variants?.length ? [] : product.featuredImages
              }
              name={variation.displayTitle}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
            id="buy-box"
          >
            <ProductBuyBox product={product} variation={variation} />
            <DeliveryChecker />
          </motion.div>
        </div>

        <Separator className="my-16" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl space-y-4"
        >
          <h2 className="font-display text-2xl text-foreground">Description</h2>
          {product.description ? (
            <p className="text-base leading-relaxed whitespace-pre-wrap text-ink-muted">
              {product.description}
            </p>
          ) : (
            <p className="text-sm text-ink-faint">No description provided.</p>
          )}
        </motion.div>

        {product.specifications && (
          <div className="mt-12 max-w-2xl">
            <ProductSpecifications specifications={product.specifications} />
          </div>
        )}

        <Separator className="my-16" />

        <ProductReviews product={product} reviews={reviews} />

        <Separator className="my-16" />

        <FrequentlyBoughtTogether products={bundleProducts} />

        <Separator className="my-16" />

        <RelatedProducts products={relatedProducts} />
      </div>

      <StickyBuyBox product={product} variation={variation} />
    </div>
  );
}
