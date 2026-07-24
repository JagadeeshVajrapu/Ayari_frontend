'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { X, ShoppingBag, Heart } from 'lucide-react';
import { StarRating } from './star-rating';
import { ProductPrice } from '@/components/common/product-price';
import { SafeImage } from '@/components/ui/safe-image';
import { useShopStore } from '@/features/shop/stores/shop.store';
import type { ListingProduct } from '@/types/product.types';
import { getDefaultVariantId } from '@/lib/product-variations';
import { Button } from '@/components/ui/button';

interface QuickViewModalProps {
  product: ListingProduct | null;
  onClose: () => void;
}

function shortDescription(text: string, max = 160): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max).trim()}…`;
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
                className="fixed inset-0 z-[70] bg-ink/65 backdrop-blur-sm"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <div
                className="fixed inset-0 z-[71] flex items-center justify-center p-4 sm:p-6"
                onClick={onClose}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: 8 }}
                  transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                  onClick={(event) => event.stopPropagation()}
                  className="relative flex max-h-[min(88vh,640px)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-border/60 bg-cream shadow-premium outline-none dark:bg-surface-elevated sm:rounded-4xl"
                >
                  <Dialog.Close
                    className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-background/95 text-foreground shadow-soft transition-colors hover:bg-foreground/10"
                    aria-label="Close quick view"
                  >
                    <X className="h-4 w-4" />
                  </Dialog.Close>

                  <div className="grid min-h-0 flex-1 overflow-y-auto md:grid-cols-2 md:overflow-hidden">
                    <div className="relative aspect-square shrink-0 bg-muted md:aspect-auto md:min-h-[420px]">
                      <SafeImage
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain p-5 md:object-cover md:p-0"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>

                    <div className="flex min-h-0 flex-col p-5 sm:p-7 md:overflow-y-auto">
                      <p className="pr-10 text-[10px] tracking-[0.2em] text-ink-faint uppercase">
                        {product.brand} · {product.category}
                      </p>

                      <Dialog.Title className="mt-2 line-clamp-3 font-display text-xl leading-snug text-foreground sm:text-2xl">
                        {product.name}
                      </Dialog.Title>

                      <div className="mt-3">
                        <StarRating
                          rating={product.rating}
                          showValue
                          reviewCount={product.reviewCount}
                        />
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
                        {shortDescription(product.description || '')}
                      </Dialog.Description>

                      <p className="mt-3 text-xs text-ink-faint">
                        {product.inStock
                          ? `${product.stockCount} items in stock`
                          : 'Currently out of stock'}
                      </p>

                      <div className="mt-6 flex gap-3 md:mt-auto md:pt-8">
                        <Button
                          variant="default"
                          size="lg"
                          className="h-12 flex-1"
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
                          className="h-12 w-12 shrink-0"
                          aria-label="Toggle wishlist"
                          onClick={() => toggleWishlist(product.slug)}
                        >
                          <Heart
                            className={
                              isInWishlist(product.slug)
                                ? 'fill-champagne text-champagne'
                                : ''
                            }
                          />
                        </Button>
                      </div>

                      <Link
                        href={`/products/${product.slug}`}
                        className="mt-4 text-center text-xs font-medium text-champagne-dark transition-colors hover:text-champagne hover:underline"
                        onClick={onClose}
                      >
                        View full details
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
