'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Loader2 } from 'lucide-react';
import { SafeImage } from '@/components/ui/safe-image';
import { useShopStore, formatPrice } from '@/features/shop/stores/shop.store';
import { catalogService } from '@/services/catalog.service';
import { mapApiProductToListing } from '@/lib/catalog-mappers';
import type { ListingProduct } from '@/types/product.types';
import { getDefaultVariantId } from '@/lib/product-variations';
import { Button } from '@/components/ui/button';
import { AccountShell } from './account-shell';

export function WishlistView() {
  const wishlist = useShopStore((s) => s.wishlist);
  const toggleWishlist = useShopStore((s) => s.toggleWishlist);
  const addToCart = useShopStore((s) => s.addToCart);
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
          return { slug, product: mapApiProductToListing(data.data.product) };
        } catch {
          return { slug, product: null };
        }
      }),
    )
      .then((results) => {
        if (cancelled) return;
        const valid = results
          .filter((entry): entry is { slug: string; product: ListingProduct } => entry.product !== null)
          .map((entry) => entry.product);
        setProducts(valid);

        // Drop stale wishlist slugs that no longer resolve
        const missing = results.filter((entry) => entry.product === null).map((entry) => entry.slug);
        if (missing.length) {
          const { wishlist: current, toggleWishlist: toggle } = useShopStore.getState();
          for (const slug of missing) {
            if (current.includes(slug)) toggle(slug);
          }
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
      <AccountShell title="Wishlist" description="Products you saved while shopping">
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-champagne-dark" />
        </div>
      </AccountShell>
    );
  }

  if (products.length === 0) {
    return (
      <AccountShell title="Wishlist" description="Products you saved while shopping">
        <div className="rounded-3xl border border-border/60 bg-surface-elevated p-10 text-center">
          <Heart className="mx-auto h-10 w-10 text-ink-faint" />
          <h2 className="mt-4 font-display text-xl text-foreground">Your wishlist is empty</h2>
          <p className="mt-2 text-sm text-ink-muted">Save products you love while browsing the shop.</p>
          <Button className="mt-6" variant="champagne" asChild>
            <Link href="/shop">Browse Shop</Link>
          </Button>
        </div>
      </AccountShell>
    );
  }

  return (
    <AccountShell title="Wishlist" description="Products you saved while shopping">
    <div className="grid gap-4 sm:grid-cols-2">
      {products.map((product) => (
        <div
          key={product.slug}
          className="flex gap-4 rounded-3xl border border-border/60 bg-surface-elevated p-4 shadow-soft"
        >
          <Link
            href={`/products/${product.slug}`}
            className="relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl"
          >
            <SafeImage src={product.image} alt={product.name} fill className="object-cover" sizes="96px" />
          </Link>
          <div className="flex min-w-0 flex-1 flex-col justify-between">
            <div>
              <p className="text-xs text-ink-faint uppercase">{product.category}</p>
              <Link
                href={`/products/${product.slug}`}
                className="font-medium text-foreground hover:text-champagne-dark"
              >
                {product.name}
              </Link>
              <p className="mt-1 text-sm font-semibold">{formatPrice(product.price)}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => toggleWishlist(product.slug)}>
                Remove
              </Button>
              <Button
                size="sm"
                onClick={() => addToCart(product.slug, 1, getDefaultVariantId(product))}
              >
                Add to Bag
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
    </AccountShell>
  );
}
