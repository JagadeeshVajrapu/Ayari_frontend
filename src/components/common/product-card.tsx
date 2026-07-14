'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProductPrice } from '@/components/common/product-price';
import { cn } from '@/lib/utils';

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  isNew?: boolean;
  isFeatured?: boolean;
  discountPercent?: number;
}

interface ProductCardProps {
  product: Product;
  className?: string;
  index?: number;
  variant?: 'default' | 'compact' | 'deal';
}

export function ProductCard({
  product,
  className,
  index = 0,
  variant = 'default',
}: ProductCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, scale: 1.02 }}
      className={cn('group', className)}
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative overflow-hidden rounded-3xl bg-cream-dark shadow-soft transition-all duration-500 group-hover:shadow-premium">
          <div
            className={cn(
              'relative overflow-hidden',
              variant === 'compact' ? 'aspect-square' : 'aspect-[3/4]',
            )}
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              loading="lazy"
              quality={75}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="image-zoom object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            {product.discountPercent && (
              <motion.span
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', delay: index * 0.05 + 0.2 }}
                className="absolute top-4 left-4 rounded-full bg-ink px-3 py-1 text-[10px] font-bold tracking-wider text-champagne uppercase"
              >
                -{product.discountPercent}%
              </motion.span>
            )}

            {product.isNew && !product.discountPercent && (
              <Badge className="absolute top-4 left-4" variant="default">
                New
              </Badge>
            )}

            {product.isFeatured && (
              <Badge className="absolute top-4 right-4" variant="secondary">
                Hot
              </Badge>
            )}

            <div className="absolute right-4 bottom-4 left-4 flex translate-y-4 gap-2 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
              <Button
                type="button"
                variant="glass"
                size="icon"
                aria-label="Add to wishlist"
                className="h-10 w-10 hover:scale-110"
                onClick={(e) => e.preventDefault()}
              >
                <Heart className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                aria-label="Add to cart"
                className="h-10 flex-1 text-xs tracking-wider uppercase"
                onClick={(e) => e.preventDefault()}
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                Add to Bag
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-1">
          <p className="text-[10px] tracking-[0.15em] text-ink-faint uppercase">
            {product.category}
          </p>
          <h3 className="font-display text-base text-ink transition-colors group-hover:text-champagne-dark md:text-lg">
            {product.name}
          </h3>
          <ProductPrice
            size="sm"
            price={product.price}
            mrp={product.originalPrice}
            discountPercent={product.discountPercent}
          />
        </div>
      </Link>
    </motion.article>
  );
}
