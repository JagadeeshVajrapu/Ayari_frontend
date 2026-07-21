'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Plus, ShoppingBag } from 'lucide-react';
import { formatPrice, useShopStore } from '@/features/shop/stores/shop.store';
import { Button } from '@/components/ui/button';
import type { ListingProduct } from '@/types/product.types';
import { getDefaultVariantId } from '@/lib/product-variations';

interface FrequentlyBoughtTogetherProps {
  products: ListingProduct[];
}

export function FrequentlyBoughtTogether({ products }: FrequentlyBoughtTogetherProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(products.map((p) => p.id)));
  const { addToCart } = useShopStore();

  const selectedProducts = products.filter((p) => selected.has(p.id));
  const totalPrice = selectedProducts.reduce((sum, p) => sum + p.price, 0);
  const bundlePrice = Math.round(totalPrice * 0.9);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const addBundleToCart = () => {
    selectedProducts.forEach((p) => addToCart(p.slug, 1, getDefaultVariantId(p)));
  };

  if (products.length < 2) return null;

  return (
    <section className="space-y-8">
      <div>
        <p className="text-xs font-medium tracking-[0.25em] text-champagne-dark uppercase dark:text-champagne">
          Complete the Look
        </p>
        <h2 className="mt-2 font-display text-display-md text-foreground">
          Frequently Bought Together
        </h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-4xl border border-border/60 bg-surface-elevated p-6 shadow-soft sm:p-8"
      >
        <div className="flex flex-col items-center gap-6 lg:flex-row lg:gap-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {products.map((product, i) => (
              <div key={product.id} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggle(product.id)}
                  className={`group relative transition-opacity ${selected.has(product.id) ? 'opacity-100' : 'opacity-40'}`}
                >
                  <div className="relative h-28 w-24 overflow-hidden rounded-2xl sm:h-36 sm:w-28">
                    <Image src={product.image} alt={product.name} fill className="object-cover" sizes="112px" />
                  </div>
                  <div
                    className={`absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      selected.has(product.id)
                        ? 'border-champagne bg-champagne'
                        : 'border-border bg-surface-elevated'
                    }`}
                  >
                    {selected.has(product.id) && (
                      <span className="text-[10px] font-bold text-ink">✓</span>
                    )}
                  </div>
                  <p className="mt-2 max-w-[7rem] truncate text-center text-xs text-ink-muted">
                    {product.name}
                  </p>
                </button>
                {i < products.length - 1 && (
                  <Plus className="h-5 w-5 text-ink-faint" />
                )}
              </div>
            ))}
          </div>

          <div className="w-full border-t border-border/60 pt-6 text-center lg:w-auto lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8 lg:text-left">
            <p className="text-sm text-ink-muted">
              Total:{' '}
              <span className="text-ink-faint line-through">{formatPrice(totalPrice)}</span>
            </p>
            <p className="mt-1 font-display text-2xl text-foreground">
              {formatPrice(bundlePrice)}
            </p>
            <p className="mt-1 text-xs text-green-600 dark:text-green-400">
              Save 10% on bundle
            </p>
            <Button variant="default" size="lg" className="mt-4 w-full lg:w-auto" onClick={addBundleToCart}>
              <ShoppingBag className="h-4 w-4" />
              Add Bundle to Cart
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
