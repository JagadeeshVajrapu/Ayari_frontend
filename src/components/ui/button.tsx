'use client';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans text-sm font-medium transition-all duration-500 ease-premium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'rounded-full bg-brand text-white shadow-soft hover:bg-brand-dark hover:shadow-medium active:scale-[0.98] dark:text-white',
        champagne:
          'rounded-full bg-gradient-brand text-white shadow-glow hover:shadow-premium hover:brightness-110 active:scale-[0.98]',
        outline:
          'rounded-full border border-brand/25 bg-transparent text-foreground hover:border-brand hover:bg-brand/5 active:scale-[0.98]',
        ghost:
          'rounded-full text-ink hover:bg-ink/5 active:scale-[0.98]',
        glass:
          'rounded-full glass text-ink hover:bg-white/80 hover:shadow-medium active:scale-[0.98]',
        link: 'text-ink underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-7',
        sm: 'h-9 px-5 text-xs tracking-wide uppercase',
        lg: 'h-14 px-10 text-base',
        xl: 'h-16 px-12 text-base tracking-wide',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  ripple?: boolean;
}

function createRipple(event: React.MouseEvent<HTMLElement>) {
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  const ripple = document.createElement('span');
  ripple.className = 'ripple-effect';
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;

  button.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ripple = true, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple && !asChild && !props.disabled) {
        createRipple(event);
      }
      onClick?.(event);
    };

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          ripple && !asChild && 'ripple-container',
        )}
        ref={ref}
        onClick={asChild ? onClick : handleClick}
        suppressHydrationWarning={!asChild}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
