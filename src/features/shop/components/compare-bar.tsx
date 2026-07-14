'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRightLeft } from 'lucide-react';
import { useShopStore, formatPrice } from '@/features/shop/stores/shop.store';
import { catalogService } from '@/services/catalog.service';
import { mapApiProductToListing } from '@/lib/catalog-mappers';
import type { ListingProduct } from '@/types/product.types';
import { Button } from '@/components/ui/button';

export function CompareBar() {
  const { compare, toggleCompare } = useShopStore();
  const [compareProducts, setCompareProducts] = useState<ListingProduct[]>([]);

  useEffect(() => {
    if (compare.length === 0) {
      setCompareProducts([]);
      return;
    }

    let cancelled = false;

    Promise.all(
      compare.map(async (slug) => {
        try {
          const { data } = await catalogService.getProduct(slug);
          return mapApiProductToListing(data.data.product);
        } catch {
          return null;
        }
      }),
    ).then((results) => {
      if (!cancelled) {
        setCompareProducts(results.filter((product): product is ListingProduct => product !== null));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [compare]);

  if (compareProducts.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 p-4 shadow-premium backdrop-blur-md"
      >
        <div className="container-premium flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <ArrowRightLeft className="h-4 w-4" />
            Compare ({compareProducts.length})
          </div>

          <div className="flex flex-1 flex-wrap gap-3">
            {compareProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 rounded-2xl border border-border/60 bg-surface-elevated px-3 py-2"
              >
                <div className="relative h-10 w-10 overflow-hidden rounded-xl">
                  <Image src={product.image} alt={product.name} fill className="object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-foreground">{product.name}</p>
                  <p className="text-xs text-ink-muted">{formatPrice(product.price)}</p>
                </div>
                <button type="button" onClick={() => toggleCompare(product.slug)} aria-label="Remove">
                  <X className="h-4 w-4 text-ink-faint" />
                </button>
              </div>
            ))}
          </div>

          <Button variant="champagne" size="sm" asChild>
            <Link href="/shop">Compare in Shop</Link>
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
