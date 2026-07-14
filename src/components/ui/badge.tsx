import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-wider uppercase transition-colors',
  {
    variants: {
      variant: {
        default: 'border-champagne/30 bg-champagne/10 text-champagne-dark',
        secondary: 'border-ink/10 bg-secondary text-ink-muted',
        outline: 'border-ink/15 text-ink-muted',
        dark: 'border-white/20 bg-white/10 text-cream',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
