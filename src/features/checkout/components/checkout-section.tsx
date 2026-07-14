import { cn } from '@/lib/utils';

interface CheckoutSectionProps {
  title: string;
  description?: string;
  step?: number;
  children: React.ReactNode;
  className?: string;
}

export function CheckoutSection({
  title,
  description,
  step,
  children,
  className,
}: CheckoutSectionProps) {
  return (
    <section
      className={cn(
        'rounded-3xl border border-border/60 bg-surface-elevated p-5 shadow-soft sm:p-6',
        className,
      )}
    >
      <div className="mb-5 flex items-start gap-3">
        {step !== undefined && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-champagne/15 text-sm font-semibold text-champagne-dark dark:text-champagne">
            {step}
          </span>
        )}
        <div>
          <h2 className="font-display text-lg text-foreground">{title}</h2>
          {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}
