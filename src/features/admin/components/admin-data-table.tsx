'use client';

import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render: (item: T) => React.ReactNode;
}

interface AdminDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  compact?: boolean;
}

export function AdminDataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No results found',
  compact = false,
}: AdminDataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/60">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-muted/50">
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase',
                  compact ? 'py-2.5' : 'py-3',
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-card/30">
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/30"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    'px-4 text-foreground',
                    compact ? 'py-2.5' : 'py-3.5',
                    col.className,
                  )}
                >
                  {col.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
