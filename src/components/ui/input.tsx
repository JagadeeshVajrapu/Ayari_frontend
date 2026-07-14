import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        suppressHydrationWarning
        className={cn(
          'flex h-12 w-full rounded-2xl border border-border/80 bg-surface-elevated px-5 py-2 text-sm text-foreground shadow-soft transition-all duration-300 placeholder:text-ink-faint focus-visible:border-champagne/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-border dark:bg-surface',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
