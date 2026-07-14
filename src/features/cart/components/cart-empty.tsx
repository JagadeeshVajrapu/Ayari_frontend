'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CartEmpty() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
        <ShoppingBag className="h-10 w-10 text-ink-faint" />
      </div>
      <h1 className="font-display text-3xl text-foreground">Your bag is empty</h1>
      <p className="mt-3 max-w-sm text-ink-muted">
        Looks like you haven&apos;t added anything yet. Explore our curated collection and find
        something you love.
      </p>
      <Button variant="champagne" size="lg" className="mt-8" asChild>
        <Link href="/shop">Start Shopping</Link>
      </Button>
    </motion.div>
  );
}
