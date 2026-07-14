'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { TrackingTimelineStep } from '@/features/tracking/types/tracking.types';
import { getTimelineIcon } from '@/features/tracking/lib/tracking-constants';

interface TrackingTimelineProps {
  steps: TrackingTimelineStep[];
}

export const TrackingTimeline = memo(function TrackingTimeline({ steps }: TrackingTimelineProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-3xl border border-border/60 bg-surface-elevated p-6 shadow-soft sm:p-8"
    >
      <h3 className="font-display text-xl text-foreground">Tracking Timeline</h3>
      <p className="mt-1 text-sm text-ink-muted">Follow your order from placement to delivery</p>

      <div className="relative mt-8">
        <div className="absolute top-0 bottom-0 left-[19px] w-0.5 bg-border sm:left-[23px]" aria-hidden />

        <motion.div
          className="absolute top-0 left-[19px] w-0.5 origin-top bg-gradient-to-b from-green-500 via-blue-500 to-border sm:left-[23px]"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            height: `${Math.max(
              0,
              ((steps.findIndex((s) => s.state === 'current') + 1) / steps.length) * 100,
            )}%`,
          }}
        />

        <ul className="space-y-0">
          {steps.map((step, index) => {
            const Icon = getTimelineIcon(step.icon);
            const isCompleted = step.state === 'completed';
            const isCurrent = step.state === 'current';
            const isUpcoming = step.state === 'upcoming';

            return (
              <motion.li
                key={step.key}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative flex gap-4 pb-8 last:pb-0"
              >
                <div className="relative z-10 shrink-0">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all sm:h-12 sm:w-12',
                      isCompleted && 'border-green-500 bg-green-500 text-white shadow-[0_0_12px_rgba(34,197,94,0.4)]',
                      isCurrent && 'border-blue-500 bg-blue-500 text-white shadow-[0_0_16px_rgba(59,130,246,0.5)]',
                      isUpcoming && 'border-border bg-muted text-ink-muted',
                    )}
                  >
                    {isCurrent && (
                      <motion.span
                        className="absolute inset-0 rounded-full border-2 border-blue-400"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                    <Icon className="relative h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                </div>

                <div
                  className={cn(
                    'min-w-0 flex-1 rounded-2xl border p-4 transition-colors',
                    isCompleted && 'border-green-500/20 bg-green-500/5',
                    isCurrent && 'border-blue-500/30 bg-blue-500/5',
                    isUpcoming && 'border-border/50 bg-muted/20 opacity-70',
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p
                      className={cn(
                        'font-medium',
                        isCompleted && 'text-green-700 dark:text-green-400',
                        isCurrent && 'text-blue-700 dark:text-blue-400',
                        isUpcoming && 'text-ink-muted',
                      )}
                    >
                      {step.label}
                    </p>
                    {(step.date || step.time) && (
                      <p className="text-xs text-ink-muted">
                        {step.date}
                        {step.time ? ` · ${step.time}` : ''}
                      </p>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">{step.description}</p>
                  {(step.location || step.updatedBy) && (
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-ink-faint">
                      {step.location && <span>📍 {step.location}</span>}
                      {step.updatedBy && <span>Updated by {step.updatedBy}</span>}
                    </div>
                  )}
                </div>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </motion.div>
  );
});
