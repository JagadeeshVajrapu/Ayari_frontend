import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, error, children, className }: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-xs font-medium tracking-wider text-ink-muted uppercase">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
