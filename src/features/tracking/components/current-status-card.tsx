'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import type { CurrentStatusCard as CurrentStatusCardType } from '@/features/tracking/types/tracking.types';
import type { SocketConnectionStatus } from '@/features/tracking/types/socket.types';
import { formatTrackingDate } from '@/features/tracking/lib/tracking-constants';

interface CurrentStatusCardProps {
  data: CurrentStatusCardType;
  connectionStatus?: SocketConnectionStatus;
  liveUpdateKey?: number;
}

export const CurrentStatusCard = memo(function CurrentStatusCard({
  data,
  connectionStatus,
  liveUpdateKey = 0,
}: CurrentStatusCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-3xl border border-border/60 bg-surface-elevated shadow-soft"
    >
      <div className="border-b border-border/50 bg-gradient-to-r from-blue-500/10 via-champagne/5 to-transparent px-6 py-5 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-wider text-ink-muted uppercase">Order</p>
            <h2 className="font-display text-2xl text-foreground sm:text-3xl">#{data.orderNumber}</h2>
          </div>
          {connectionStatus === 'connected' && (
            <span className="rounded-full bg-green-500/10 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-green-600 uppercase dark:text-green-400">
              Live
            </span>
          )}
        </div>
      </div>

      <div className="space-y-6 p-6 sm:p-8">
        <div>
          <p className="text-sm text-ink-muted">Current Status</p>
          <motion.p
            key={`${data.currentStatus}-${liveUpdateKey}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="mt-1 font-display text-2xl text-blue-600 dark:text-blue-400"
          >
            {data.currentStatus}
          </motion.p>
          <p className="mt-2 text-sm text-ink-muted">{data.statusDescription}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-muted/40 p-4">
            <p className="text-xs text-ink-muted">Estimated Delivery</p>
            <p className="mt-1 font-medium text-foreground">
              {formatTrackingDate(data.estimatedDelivery)}
            </p>
          </div>
          <div className="rounded-2xl bg-muted/40 p-4">
            <p className="text-xs text-ink-muted">Last Updated</p>
            <p className="mt-1 font-medium text-foreground">
              {formatTrackingDate(data.lastUpdated)}
            </p>
          </div>
          <div className="rounded-2xl bg-muted/40 p-4">
            <p className="text-xs text-ink-muted">Current Location</p>
            <p className="mt-1 flex items-center gap-1.5 font-medium text-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
              {data.currentLocation ?? '—'}
            </p>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-ink-muted">
            <span>Shipment Progress</span>
            <span>{data.progressPercent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              key={`progress-${data.progressPercent}-${liveUpdateKey}`}
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-champagne"
              initial={{ width: 0 }}
              animate={{ width: `${data.progressPercent}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
});
