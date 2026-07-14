'use client';

import { cn } from '@/lib/utils';

const items = [
  'Free Worldwide Shipping',
  'Authenticity Guaranteed',
  'Premium Packaging',
  '30-Day Returns',
  'Sustainable Materials',
  'Exclusive Collections',
];

export function Marquee() {
  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-y border-border/60 bg-surface py-4">
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className={cn(
              'mx-8 flex items-center gap-8 text-xs font-medium tracking-[0.2em] text-ink-muted uppercase',
            )}
          >
            {item}
            <span className="text-champagne">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
