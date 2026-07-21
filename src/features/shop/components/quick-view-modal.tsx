'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { X, ShoppingBag, Heart } from 'lucide-react';
import { StarRating } from './star-rating';
import { ProductPrice } from '@/components/common/product-price';
import { useShopStore } from '@/features/shop/stores/shop.store';
import type { ListingProduct } from '@/types/product.types';
import { getDefaultVariantId } from '@/lib/product-variations';
import { Button } from '@/components/ui/button';

interface QuickViewModalProps {
  product: ListingProduct | null;
  onClose: () => void;
}

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useShopStore();

  return (
    <Dialog.Root open={!!product} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {product && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-4xl glass-auth p-0 shadow-premium focus:outline-none"
              >
                <div className="grid md:grid-cols-2">
                  <div className="relative aspect-square md:aspect-auto md:min-h-[420px]">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="rounded-t-4xl object-cover md:rounded-l-4xl md:rounded-tr-none"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>

                  <div className="flex flex-col p-6 sm:p-8">
                    <Dialog.Close className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full glass transition-colors hover:bg-foreground/10">
                      <X className="h-4 w-4" />
                    </Dialog.Close>

                    <p className="text-[10px] tracking-[0.2em] text-ink-faint uppercase">
                      {product.brand} · {product.category}
                    </p>
                    <Dialog.Title className="mt-2 font-display text-2xl text-foreground sm:text-3xl">
                      {product.name}
                    </Dialog.Title>

                    <div className="mt-3">
                      <StarRating rating={product.rating} showValue reviewCount={product.reviewCount} />
                    </div>

                    <ProductPrice
                      className="mt-4"
                      size="md"
                      layout="stacked"
                      price={product.price}
                      mrp={product.originalPrice}
                      discountPercent={product.discountPercent}
                    />

                    <Dialog.Description className="mt-4 text-sm leading-relaxed text-ink-muted">
                      {product.description}
                    </Dialog.Description>

                    <p className="mt-3 text-xs text-ink-faint">
                      {product.inStock
                        ? `${product.stockCount} items in stock`
                        : 'Currently out of stock'}
                    </p>

                    <div className="mt-auto flex gap-3 pt-8">
                      <Button
                        variant="default"
                        size="lg"
                        className="flex-1"
                        disabled={!product.inStock}
                        onClick={() =>
                          addToCart(product.slug, 1, getDefaultVariantId(product))
                        }
                      >
                        <ShoppingBag className="h-4 w-4" />
                        Add to Bag
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-14 w-14 shrink-0"
                        onClick={() => toggleWishlist(product.slug)}
                      >
                        <Heart
                          className={
                            isInWishlist(product.slug) ? 'fill-champagne text-champagne' : ''
                          }
                        />
                      </Button>
                    </div>

                    <Link
                      href={`/products/${product.slug}`}
                      className="mt-4 text-center text-xs text-champagne-dark transition-colors hover:text-champagne hover:underline"
                      onClick={onClose}
                    >
                      View full details
                    </Link>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
