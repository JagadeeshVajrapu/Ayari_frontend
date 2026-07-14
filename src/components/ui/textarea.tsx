import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        suppressHydrationWarning
        className={cn(
          'flex min-h-[120px] w-full resize-y rounded-2xl border border-border/80 bg-surface-elevated px-5 py-3 text-sm text-foreground shadow-soft transition-all duration-300 placeholder:text-ink-faint focus-visible:border-champagne/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-border dark:bg-surface',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
