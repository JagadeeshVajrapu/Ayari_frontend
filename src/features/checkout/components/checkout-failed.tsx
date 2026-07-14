'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const REASON_MESSAGES: Record<string, { title: string; description: string }> = {
  cancelled: {
    title: 'Payment Cancelled',
    description:
      'You closed the payment window before completing checkout. Your order is saved as pending — you can try again.',
  },
  verification: {
    title: 'Payment Verification Failed',
    description:
      'We could not verify your payment. If money was deducted, it will be refunded automatically within 5–7 business days.',
  },
  default: {
    title: 'Payment Failed',
    description:
      'Something went wrong while processing your payment. Please try again or choose a different payment method.',
  },
};

export function CheckoutFailedPage() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') ?? 'default';
  const orderId = searchParams.get('orderId');

  const content = REASON_MESSAGES[reason] ?? REASON_MESSAGES.default;

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

        {orderId && (
          <p className="mt-4 text-xs text-ink-faint">
            Reference: <span className="font-mono text-ink-muted">{orderId}</span>
          </p>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button variant="champagne" asChild>
            <Link href="/checkout">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Link>
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
