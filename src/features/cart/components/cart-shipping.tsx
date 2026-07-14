'use client';

import { motion } from 'framer-motion';
import { Truck, Zap } from 'lucide-react';
import { formatPrice, useShopStore, type ShippingMethod } from '@/features/shop/stores/shop.store';
import { calculateShipping, FREE_SHIPPING_THRESHOLD } from '@/features/cart/lib/cart-calculations';
import { cn } from '@/lib/utils';

interface CartShippingProps {
  subtotal: number;
}

const OPTIONS: {
  id: ShippingMethod;
  label: string;
  description: string;
  icon: typeof Truck;
  days: string;
}[] = [
  {
    id: 'standard',
    label: 'Standard Delivery',
    description: `Free on orders over ${formatPrice(FREE_SHIPPING_THRESHOLD)}`,
    icon: Truck,
    days: '5–7 business days',
  },
  {
    id: 'express',
    label: 'Express Delivery',
    description: 'Priority handling & tracking',
    icon: Zap,
    days: '2–3 business days',
  },
];

export function CartShipping({ subtotal }: CartShippingProps) {
  const { shippingMethod, setShippingMethod } = useShopStore();

  return (
    <div className="rounded-3xl border border-border/60 bg-surface-elevated p-5 shadow-soft">
      <h3 className="mb-4 text-sm font-medium text-foreground">Shipping Method</h3>
      <div className="space-y-3">
        {OPTIONS.map((option) => {
          const price = calculateShipping(subtotal, option.id);
          const Icon = option.icon;
          const selected = shippingMethod === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setShippingMethod(option.id)}
              className={cn(
                'flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all',
                selected
                  ? 'border-champagne bg-champagne/5 shadow-glow'
                  : 'border-border hover:border-champagne/40',
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl',
                  selected ? 'bg-champagne/20' : 'bg-muted',
                )}
              >
                <Icon className={cn('h-5 w-5', selected && 'text-champagne-dark dark:text-champagne')} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{option.label}</p>
                <p className="text-xs text-ink-muted">{option.description}</p>
                <p className="mt-0.5 text-[10px] text-ink-faint">{option.days}</p>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {price === 0 ? 'Free' : formatPrice(price)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
