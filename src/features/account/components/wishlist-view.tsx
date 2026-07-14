'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Loader2 } from 'lucide-react';
import { useShopStore, formatPrice } from '@/features/shop/stores/shop.store';
import { catalogService } from '@/services/catalog.service';
import { mapApiProductToListing } from '@/lib/catalog-mappers';
import type { ListingProduct } from '@/types/product.types';
import { Button } from '@/components/ui/button';

export function WishlistView() {
  const { wishlist, toggleWishlist, addToCart } = useShopStore();
  const [products, setProducts] = useState<ListingProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wishlist.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all(
      wishlist.map(async (slug) => {
        try {
          const { data } = await catalogService.getProduct(slug);
          return mapApiProductToListing(data.data.product);
        } catch {
          return null;
        }
      }),
    )
      .then((results) => {
        if (!cancelled) {
          setProducts(results.filter((product): product is ListingProduct => product !== null));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [wishlist]);

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-champagne-dark" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-3xl border border-border/60 bg-surface-elevated p-10 text-center">
        <Heart className="mx-auto h-10 w-10 text-ink-faint" />
        <h2 className="mt-4 font-display text-xl text-foreground">Your wishlist is empty</h2>
        <p className="mt-2 text-sm text-ink-muted">Save products you love while browsing the shop.</p>
        <Button className="mt-6" variant="champagne" asChild>
          <Link href="/shop">Browse Shop</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex gap-4 rounded-3xl border border-border/60 bg-surface-elevated p-4 shadow-soft"
        >
          <Link href={`/products/${product.slug}`} className="relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl">
            <Image src={product.image} alt={product.name} fill className="object-cover" />
          </Link>
          <div className="flex min-w-0 flex-1 flex-col justify-between">
            <div>
              <p className="text-xs text-ink-faint uppercase">{product.category}</p>
              <Link href={`/products/${product.slug}`} className="font-medium text-foreground hover:text-champagne-dark">
                {product.name}
              </Link>
              <p className="mt-1 text-sm font-semibold">{formatPrice(product.price)}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => toggleWishlist(product.slug)}>
                Remove
              </Button>
              <Button size="sm" onClick={() => addToCart(product.slug)}>
                Add to Bag
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
