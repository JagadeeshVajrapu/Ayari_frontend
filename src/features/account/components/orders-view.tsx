'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Loader2, Package } from 'lucide-react';
import { userService, type AdminOrder } from '@/services/admin.service';
import { getApiErrorMessage } from '@/services/auth.service';
import { formatPrice } from '@/features/shop/stores/shop.store';
import { AccountShell } from './account-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
};

export function OrdersView() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    userService
      .getMyOrders({ limit: 20 })
      .then(({ data }) => setOrders(data.data.items))
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AccountShell title="Orders" description="View and track your order history">
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-champagne" /></div>
      </AccountShell>
    );
  }

  return (
    <AccountShell title="Orders" description="View and track your order history">
      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="space-y-4">
        {orders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-3xl border border-border/60 bg-surface-elevated p-5 shadow-soft sm:p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-foreground">{order.orderNumber}</p>
                  <Badge variant="outline">{STATUS_LABELS[order.status] ?? order.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-ink-muted">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <p className="font-display text-xl text-foreground">{formatPrice(order.totalAmount)}</p>
            </div>

            <div className="mt-4 space-y-2">
              {order.items.map((item, itemIndex) => (
                <div
                  key={`${order.id}-${itemIndex}`}
                  className="flex items-center justify-between rounded-2xl bg-muted/40 px-4 py-3 text-sm"
                >
                  <div>
                    <span className="font-medium">{item.productName}</span>
                    {item.variantName ? (
                      <span className="text-ink-muted"> · {item.variantName}</span>
                    ) : null}
                    {item.productSku ? (
                      <p className="mt-0.5 text-xs text-ink-faint">SKU: {item.productSku}</p>
                    ) : null}
                  </div>
                  <span className="text-ink-muted">
                    Qty {item.quantity} · {formatPrice(item.totalPrice)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/orders/${order.id}/tracking`}>Track Shipment</Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={async () => {
                  try {
                    const { api } = await import('@/services/auth.service');
                    const response = await api.get(`/users/me/orders/${order.id}/invoice`, {
                      responseType: 'text',
                    });
                    const blob = new Blob([response.data as string], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    window.open(url, '_blank', 'noopener,noreferrer');
                  } catch {
                    // ignore — user can retry
                  }
                }}
              >
                Download Invoice
              </Button>
            </div>
          </motion.div>
        ))}

        {orders.length === 0 && !error && (
          <div className="flex flex-col items-center py-16 text-center">
            <Package className="mb-4 h-12 w-12 text-ink-faint" />
            <p className="font-display text-xl text-foreground">No orders yet</p>
            <p className="mt-2 max-w-sm text-sm text-ink-muted">When you place an order, it will appear here with status updates.</p>
            <Button variant="champagne" className="mt-4" asChild>
              <Link href="/shop">Start Shopping</Link>
            </Button>
          </div>
        )}
      </div>
    </AccountShell>
  );
}
