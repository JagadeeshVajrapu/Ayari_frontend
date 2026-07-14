'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TrackingHistoryItem } from '@/features/tracking/types/tracking.types';

interface TrackingHistoryListProps {
  items: TrackingHistoryItem[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export const TrackingHistoryList = memo(function TrackingHistoryList({
  items,
  loading,
  hasMore,
  onLoadMore,
}: TrackingHistoryListProps) {
  if (!items.length) {
    return (
      <div className="rounded-3xl border border-border/60 bg-surface-elevated p-8 text-center shadow-soft">
        <p className="text-sm text-ink-muted">No tracking updates yet. Check back soon.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-3xl border border-border/60 bg-surface-elevated p-6 shadow-soft sm:p-8"
    >
      <h3 className="font-display text-xl text-foreground">Tracking History</h3>
      <p className="mt-1 text-sm text-ink-muted">Every shipment update in chronological order</p>

      <div className="mt-6 divide-y divide-border/60">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="flex flex-col gap-2 py-5 first:pt-0 sm:flex-row sm:items-start sm:justify-between"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{item.statusLabel}</p>
              {item.description && (
                <p className="mt-1 text-sm text-ink-muted">{item.description}</p>
              )}
              {item.location && (
                <p className="mt-1 text-xs text-ink-faint">{item.location}</p>
              )}
              {item.updatedBy && (
                <p className="mt-1 text-xs text-ink-faint">Updated by {item.updatedBy}</p>
              )}
            </div>
            <div className="shrink-0 text-right text-sm text-ink-muted">
              <p>{item.date}</p>
              <p className="text-xs">{item.time}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" size="sm" onClick={onLoadMore} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Load more updates'}
          </Button>
        </div>
      )}
    </motion.div>
  );
});
