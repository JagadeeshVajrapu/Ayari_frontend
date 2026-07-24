'use client';

import { AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useShopStore } from '@/features/shop/stores/shop.store';
import { calculateCartTotals } from '@/features/cart/lib/cart-calculations';
import { useCartLineItems } from '@/features/cart/hooks/use-cart-line-items';
import { CartItemRow } from './cart-item-row';
import { CartShipping } from './cart-shipping';
import { MobileCartCheckoutBar, OrderSummary } from './order-summary';
import { CartEmpty } from './cart-empty';

export function CartPage() {
  const { cart, shippingMethod } = useShopStore();
  const { lineItems, loading, error } = useCartLineItems(cart);
  const totals = calculateCartTotals(lineItems, shippingMethod, 0);

  if (!loading && lineItems.length === 0) {
    return (
      <div className="section-padding pt-8">
        <div className="container-premium">
          <CartEmpty />
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding pt-8 pb-28 lg:pb-16">
      <div className="container-premium">
        <div className="mb-8 sm:mb-10">
          <h1 className="font-display text-3xl text-foreground sm:text-display-md">Shopping Bag</h1>
          <p className="mt-2 text-sm text-ink-muted sm:text-base">
            {loading
              ? 'Loading your bag...'
              : `${totals.itemCount} ${totals.itemCount === 1 ? 'item' : 'items'} in your bag`}
          </p>
        </div>

        {error && (
          <p className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-champagne-dark" />
          </div>
        ) : (
          <>
            <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
              <div className="space-y-4 lg:col-span-2">
                <AnimatePresence mode="popLayout">
                  {lineItems.map((item, index) => (
                    <CartItemRow
                      key={`${item.product.slug}::${item.variantId ?? 'default'}`}
                      item={item}
                      index={index}
                    />
                  ))}
                </AnimatePresence>

                <div className="grid gap-4 pt-4 sm:grid-cols-2">
                  <CartShipping subtotal={totals.subtotal} />
                </div>
              </div>

              <div className="lg:col-span-1">
                <OrderSummary totals={totals} shippingMethod={shippingMethod} />
              </div>
            </div>
            <MobileCartCheckoutBar total={totals.total} />
          </>
        )}
      </div>
    </div>
  );
}
