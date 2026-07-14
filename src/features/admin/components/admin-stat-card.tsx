'use client';

import { cn } from '@/lib/utils';

interface AdminStatCardProps {
  label: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  className?: string;
}

export function AdminStatCard({ label, value, change, icon, className }: AdminStatCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-5 shadow-soft',
        className,
      )}
    >
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-brand/5 blur-2xl" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">{label}</p>
          <p className="mt-2 font-display text-2xl text-foreground">{value}</p>
          {change !== undefined && (
            <p
              className={cn(
                'mt-1 text-xs font-medium',
                change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
              )}
            >
              {change >= 0 ? '+' : ''}
              {change}% vs last month
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
          {icon}
        </div>
      </div>
    </div>
  );
}
