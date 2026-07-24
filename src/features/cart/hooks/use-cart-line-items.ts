'use client';

import { useEffect, useMemo, useState } from 'react';
import { catalogService } from '@/services/catalog.service';
import { mapApiProductToListing } from '@/lib/catalog-mappers';
import { buildCartLineItem, type CartLineItem } from '@/features/cart/lib/cart-calculations';
import type { CartItemRef } from '@/features/shop/lib/cart-keys';

export function useCartLineItems(cart: CartItemRef[]) {
  const [lineItems, setLineItems] = useState<CartLineItem[]>([]);
  const [loading, setLoading] = useState(cart.length > 0);
  const [error, setError] = useState('');

  const cartSignature = useMemo(
    () =>
      cart
        .map((item) => `${item.productId}::${item.variantId ?? ''}::${item.quantity}`)
        .join('|'),
    [cart],
  );

  useEffect(() => {
    if (cart.length === 0) {
      setLineItems([]);
      setLoading(false);
      setError('');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');

    Promise.all(
      cart.map(async (item) => {
        try {
          const { data } = await catalogService.getProduct(item.productId);
          const product = mapApiProductToListing(data.data.product);
          return buildCartLineItem(product, item.quantity, item.variantId);
        } catch {
          return null;
        }
      }),
    )
      .then((results) => {
        if (cancelled) return;
        const valid = results.filter((item): item is CartLineItem => item !== null);
        setLineItems(valid);
        if (valid.length < cart.length) {
          setError('Some items in your bag are no longer available.');
        }
      })
      .catch(() => {
        if (!cancelled) setError('Unable to load cart items.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // cartSignature tracks product/variant/qty changes reliably
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartSignature]);

  return { lineItems, loading, error };
}
