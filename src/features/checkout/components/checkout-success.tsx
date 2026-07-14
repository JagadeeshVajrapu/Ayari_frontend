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

export function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const fallbackOrderNumber = searchParams.get('order') ?? 'AYARI-ORDER';
  const method = searchParams.get('method') ?? 'online';

  const [order, setOrder] = useState<CheckoutOrderResponse | null>(null);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;

    checkoutService
      .getOrder(orderId)
      .then(({ data }) => {
        if (!cancelled) setOrder(data.data);
      })
      .catch((err) => {
        if (!cancelled) setError(getCheckoutErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

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
        ? 'Demo Payment (configure Razorpay keys for live payments)'
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
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-champagne-dark" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-champagne-dark dark:text-champagne" />
                <div>
                  <p className="text-xs text-ink-muted">Order Number</p>
                  <p className="font-medium text-foreground">{orderNumber}</p>
                </div>
              </div>
              {total !== undefined && (
                <p className="mt-4 text-sm text-ink-muted">
                  Total paid:{' '}
                  <span className="font-medium text-foreground">{formatPrice(total)}</span>
                </p>
              )}
              {status && (
                <p className="mt-2 text-sm text-ink-muted">
                  Status: <span className="text-foreground">{status.replace(/_/g, ' ')}</span>
                </p>
              )}
              <p className="mt-4 text-sm text-ink-muted">
                Payment: <span className="text-foreground">{methodLabel}</span>
              </p>
              {error && (
                <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">{error}</p>
              )}
            </>
          )}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button variant="champagne" asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
