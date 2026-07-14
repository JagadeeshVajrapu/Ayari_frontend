'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CheckCircle2, Package, Truck, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ShipmentToast {
  id: string;
  title: string;
  message: string;
  variant?: 'default' | 'success' | 'info';
}

interface ShipmentToastStackProps {
  toasts: ShipmentToast[];
  onDismiss: (id: string) => void;
}

export function ShipmentToastStack({ toasts, onDismiss }: ShipmentToastStackProps) {
  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-full max-w-sm flex-col gap-3 sm:right-6 sm:bottom-6">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="pointer-events-auto"
          >
            <div
              className={cn(
                'overflow-hidden rounded-2xl border shadow-lg backdrop-blur-xl',
                toast.variant === 'success' && 'border-green-500/30 bg-green-500/10',
                toast.variant === 'info' && 'border-blue-500/30 bg-blue-500/10',
                (!toast.variant || toast.variant === 'default') && 'border-border/60 bg-surface-elevated/95',
              )}
            >
              <div className="flex gap-3 p-4">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                    toast.variant === 'success' && 'bg-green-500/15 text-green-600 dark:text-green-400',
                    toast.variant === 'info' && 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
                    (!toast.variant || toast.variant === 'default') && 'bg-brand/10 text-brand',
                  )}
                >
                  {toast.variant === 'success' ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : toast.title.toLowerCase().includes('delivery') ? (
                    <Truck className="h-5 w-5" />
                  ) : toast.title.toLowerCase().includes('packed') ? (
                    <Package className="h-5 w-5" />
                  ) : (
                    <Bell className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{toast.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{toast.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onDismiss(toast.id)}
                  className="shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function useShipmentToasts(autoDismissMs = 6000) {
  const [toasts, setToasts] = useState<ShipmentToast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (toast: Omit<ShipmentToast, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [{ ...toast, id }, ...prev].slice(0, 4));

      if (autoDismissMs > 0) {
        window.setTimeout(() => dismiss(id), autoDismissMs);
      }
    },
    [autoDismissMs, dismiss],
  );

  return { toasts, push, dismiss };
}
