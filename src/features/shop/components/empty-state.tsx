'use client';

import { motion } from 'framer-motion';
import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onReset: () => void;
}

export function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <SearchX className="h-8 w-8 text-ink-faint" />
      </div>
      <h3 className="font-display text-2xl text-foreground">No products found</h3>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        We couldn&apos;t find any products matching your filters. Try adjusting your search or
        clearing filters.
      </p>
      <Button variant="outline" className="mt-6" onClick={onReset}>
        Clear all filters
      </Button>
    </motion.div>
  );
}
