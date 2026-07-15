'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductBuyBox } from './product-buy-box';
import type { ProductVariationState } from '@/features/product/hooks/use-product-variations';
import type { ListingProduct } from '@/types/product.types';

interface StickyBuyBoxProps {
  product: ListingProduct;
  variation: ProductVariationState;
}

export function StickyBuyBox({ product, variation }: StickyBuyBoxProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = document.getElementById('buy-box');
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/90 p-4 shadow-premium backdrop-blur-xl lg:hidden"
          >
            <ProductBuyBox product={product} variation={variation} compact />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {visible && (
          <motion.aside
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed top-32 right-6 z-40 hidden w-80 rounded-3xl glass-auth p-6 shadow-premium lg:block"
          >
            <ProductBuyBox product={product} variation={variation} compact />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
