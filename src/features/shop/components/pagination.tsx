'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1,
  );

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center gap-2 pt-12"
      aria-label="Pagination"
    >
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {visiblePages.map((page, i) => {
        const prev = visiblePages[i - 1];
        const showEllipsis = prev && page - prev > 1;

        return (
          <span key={page} className="flex items-center gap-2">
            {showEllipsis && <span className="px-1 text-ink-faint">…</span>}
            <button
              type="button"
              onClick={() => onPageChange(page)}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-all',
                page === currentPage
                  ? 'bg-ink text-cream shadow-soft'
                  : 'text-ink-muted hover:bg-muted hover:text-foreground',
              )}
            >
              {page}
            </button>
          </span>
        );
      })}

      <Button
        variant="outline"
        size="icon"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </motion.nav>
  );
}
