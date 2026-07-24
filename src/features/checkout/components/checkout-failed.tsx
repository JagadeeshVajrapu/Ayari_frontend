'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { checkoutService } from '@/services/checkout.service';

const REASON_MESSAGES: Record<string, { title: string; description: string }> = {
  cancelled: {
    title: 'Payment Cancelled',
    description:
      'You closed the payment window before completing checkout. No order was placed — you can try again anytime.',
  },
  verification: {
    title: 'Payment Verification Failed',
    description:
      'We could not confirm your payment yet. If Razorpay showed success, wait a moment and check Orders — your payment may still be confirming.',
  },
  default: {
    title: 'Payment Failed',
    description:
      'Something went wrong while processing your payment. Please try again or choose a different payment method.',
  },
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function CheckoutFailedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') ?? 'default';
  const orderId = searchParams.get('orderId');
  const [checking, setChecking] = useState(Boolean(orderId));

  const content = REASON_MESSAGES[reason] ?? REASON_MESSAGES.default;

  // Recover success races: Razorpay paid but verify finished a moment later.
  useEffect(() => {
    if (!orderId) {
      setChecking(false);
      return;
    }

    let cancelled = false;

    const recover = async () => {
      for (let attempt = 0; attempt < 8; attempt += 1) {
        try {
          const { data } = await checkoutService.getOrder(orderId);
          if (cancelled) return;
          const order = data.data;
          if (
            order.status === 'CONFIRMED' ||
            order.status === 'PROCESSING' ||
            order.paymentStatus === 'CAPTURED'
          ) {
            const params = new URLSearchParams({
              orderId: order.orderId,
              order: order.orderNumber,
              method: 'razorpay',
              status: order.status,
              total: String(order.total),
            });
            router.replace(`/checkout/success?${params.toString()}`);
            return;
          }
        } catch {
          // keep trying
        }
        await sleep(500);
      }
      if (!cancelled) setChecking(false);
    };

    void recover();

    return () => {
      cancelled = true;
    };
  }, [orderId, router]);

  if (checking) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-champagne-dark" />
        <p className="text-sm text-ink-muted">Checking payment status…</p>
      </div>
    );
  }

  return (
    <div className="section-padding pt-8">
      <div className="container-premium flex flex-col items-center py-16 text-center sm:py-24">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40"
        >
          <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
        </motion.div>

        <h1 className="font-display text-display-md text-foreground">{content.title}</h1>
        <p className="mt-3 max-w-md text-ink-muted">{content.description}</p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button variant="champagne" asChild>
            <Link href="/checkout">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/account/orders">View Orders</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/cart">
              <ArrowLeft className="h-4 w-4" />
              Back to Bag
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
