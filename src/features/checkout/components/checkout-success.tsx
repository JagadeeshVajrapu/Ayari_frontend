'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/features/shop/stores/shop.store';
import {
  checkoutService,
  getCheckoutErrorMessage,
  type CheckoutOrderResponse,
} from '@/services/checkout.service';

const CONFIRMED_STATUSES = new Set([
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
]);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const fallbackOrderNumber = searchParams.get('order') ?? 'AYARI-ORDER';
  const method = searchParams.get('method') ?? 'online';
  const statusParam = searchParams.get('status');
  const totalParam = searchParams.get('total');

  // Instant UI from redirect params — don't wait on a network round-trip.
  const [order, setOrder] = useState<CheckoutOrderResponse | null>(() => {
    if (!orderId) return null;
    const total = totalParam ? Number(totalParam) : undefined;
    return {
      orderId,
      orderNumber: fallbackOrderNumber,
      status: statusParam ?? 'CONFIRMED',
      paymentMethod: method === 'cod' ? 'COD' : 'RAZORPAY',
      total: Number.isFinite(total) ? (total as number) : 0,
    };
  });
  const [syncing, setSyncing] = useState(Boolean(orderId));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) {
      setSyncing(false);
      return;
    }

    let cancelled = false;

    const syncOrder = async () => {
      const maxAttempts = 8;
      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        try {
          const { data } = await checkoutService.getOrder(orderId);
          if (cancelled) return;

          setOrder(data.data);
          setError('');

          if (
            CONFIRMED_STATUSES.has(data.data.status) ||
            data.data.paymentStatus === 'CAPTURED' ||
            data.data.status === 'CANCELLED'
          ) {
            setSyncing(false);
            return;
          }
        } catch (err) {
          if (cancelled) return;
          // Keep showing optimistic status; only surface error after last attempt.
          if (attempt === maxAttempts - 1) {
            setError(getCheckoutErrorMessage(err));
            setSyncing(false);
            return;
          }
        }

        await sleep(350);
      }

      if (!cancelled) setSyncing(false);
    };

    void syncOrder();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const orderNumber = order?.orderNumber ?? fallbackOrderNumber;
  const total = order?.total;
  const status = order?.status;

  const methodLabel =
    method === 'cod'
      ? 'Cash on Delivery'
      : method === 'razorpay-demo'
        ? 'Mock Payment (local — set Razorpay Test Mode keys for the real checkout modal)'
        : 'Online Payment';

  return (
    <div className="section-padding pt-8">
      <div className="container-premium flex flex-col items-center py-16 text-center sm:py-24">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40"
        >
          <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
        </motion.div>

        <h1 className="font-display text-display-md text-foreground">Order Confirmed</h1>
        <p className="mt-3 max-w-md text-ink-muted">
          Thank you for shopping with AYARI. We&apos;ve received your order and will send a
          confirmation email shortly.
        </p>

        <div className="mt-8 w-full max-w-sm rounded-3xl border border-border/60 bg-surface-elevated p-6 text-left shadow-soft">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-champagne-dark dark:text-champagne" />
            <div>
              <p className="text-xs text-ink-muted">Order Number</p>
              <p className="font-medium text-foreground">{orderNumber}</p>
            </div>
          </div>
          {typeof total === 'number' && total > 0 && (
            <p className="mt-4 text-sm text-ink-muted">
              Total paid:{' '}
              <span className="font-medium text-foreground">{formatPrice(total)}</span>
            </p>
          )}
          <p className="mt-2 text-sm text-ink-muted">
            Status:{' '}
            <span className="inline-flex items-center gap-2 text-foreground">
              {(status ?? 'CONFIRMED').replace(/_/g, ' ')}
              {syncing && (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-champagne-dark" aria-label="Updating status" />
              )}
            </span>
          </p>
          <p className="mt-4 text-sm text-ink-muted">
            Payment: <span className="text-foreground">{methodLabel}</span>
          </p>
          {error && (
            <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">{error}</p>
          )}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button variant="champagne" asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/account/orders">View Orders</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
