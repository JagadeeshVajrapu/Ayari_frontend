'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Link2, Check } from 'lucide-react';
import type { ListingProduct } from '@/types/product.types';

interface ShareProductProps {
  product: ListingProduct;
}

export function ShareProduct({ product }: ShareProductProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/products/${product.slug}`
    : `/products/${product.slug}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareNative = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product.name,
        text: product.description,
        url: shareUrl,
      });
    } else {
      setOpen((o) => !o);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={shareNative}
        className="flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-foreground"
      >
        <Share2 className="h-4 w-4" />
        Share
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute top-full left-0 z-10 mt-2 rounded-2xl border border-border bg-surface-elevated p-3 shadow-medium"
          >
            <button
              type="button"
              onClick={copyLink}
              className="flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm hover:bg-muted"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Link2 className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
