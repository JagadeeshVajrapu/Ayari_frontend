'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function AdminPagination({
  page,
  totalPages,
  totalItems,
  onPageChange,
}: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visible = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
      <p className="text-xs text-muted-foreground">
        Showing page {page} of {totalPages} ({totalItems} items)
      </p>
      <nav className="flex items-center gap-1" aria-label="Pagination">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {visible.map((p, i) => {
          const prev = visible[i - 1];
          const ellipsis = prev && p - prev > 1;
          return (
            <span key={p} className="flex items-center gap-1">
              {ellipsis && <span className="px-1 text-muted-foreground">…</span>}
              <button
                type="button"
                onClick={() => onPageChange(p)}
                className={cn(
                  'flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm transition-colors',
                  p === page
                    ? 'bg-brand font-medium text-white'
                    : 'text-muted-foreground hover:bg-muted',
                )}
              >
                {p}
              </button>
            </span>
          );
        })}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
}
