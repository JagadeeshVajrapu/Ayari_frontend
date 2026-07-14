'use client';

import { useEffect, useState } from 'react';
import { catalogService } from '@/services/catalog.service';
import { mapApiProductToListing } from '@/lib/catalog-mappers';
import type { CartLineItem } from '@/features/cart/lib/cart-calculations';

export function useCartLineItems(cart: { productId: string; quantity: number }[]) {
  const [lineItems, setLineItems] = useState<CartLineItem[]>([]);
  const [loading, setLoading] = useState(cart.length > 0);
  const [error, setError] = useState('');

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
          return {
            product,
            quantity: item.quantity,
            lineTotal: product.price * item.quantity,
          } satisfies CartLineItem;
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
  }, [cart]);

  return { lineItems, loading, error };
}
