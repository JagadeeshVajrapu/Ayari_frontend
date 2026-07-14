'use client';

import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function AdminSearch({
  value,
  onChange,
  placeholder = 'Search...',
  className,
}: AdminSearchProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-border bg-background pr-4 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/20"
      />
    </div>
  );
}

interface AdminFilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  className?: string;
}

export function AdminFilterSelect({
  label,
  value,
  onChange,
  options,
  className,
}: AdminFilterSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className={cn(
        'h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/20',
        className,
      )}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
