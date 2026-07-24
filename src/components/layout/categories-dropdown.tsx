'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Grid3X3, LayoutGrid } from 'lucide-react';
import { catalogService } from '@/services/catalog.service';
import { categoryHref } from '@/lib/category-routes';
import { cn } from '@/lib/utils';

interface NavCategory {
  id: string;
  name: string;
  slug: string;
}

export function CategoriesDropdown({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<NavCategory[]>([]);
  const [loaded, setLoaded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    catalogService
      .getCategories()
      .then(({ data }) => {
        if (cancelled) return;
        setCategories(
          data.data.categories
            .filter((c) => c.isActive)
            .map((c) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
            })),
        );
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open || mobile) return;
    const onPointer = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, mobile]);

  if (mobile) {
    return (
      <div className="space-y-3">
        <p className="text-xs font-semibold tracking-[0.18em] text-ink-faint uppercase">
          Categories
        </p>
        <div className="grid gap-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={categoryHref(category.slug)}
              onClick={onNavigate}
              className="rounded-2xl border border-border/60 bg-surface-elevated px-4 py-3 text-sm text-foreground transition-colors hover:border-brand/40 hover:text-brand"
            >
              {category.name}
            </Link>
          ))}
          <Link
            href="/categories"
            onClick={onNavigate}
            className="inline-flex items-center gap-2 pt-1 text-sm font-medium text-champagne-dark"
          >
            <LayoutGrid className="h-4 w-4" />
            View all categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        className={cn(
          'group relative inline-flex items-center gap-1 whitespace-nowrap text-sm text-ink-muted transition-colors duration-300 hover:text-ink',
          open && 'text-ink',
        )}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
        onMouseEnter={() => setOpen(true)}
      >
        Categories
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
        <span
          className={cn(
            'absolute -bottom-1 left-0 h-px bg-brand transition-all duration-300',
            open ? 'w-full' : 'w-0 group-hover:w-full',
          )}
        />
      </button>

      {open && (
        <div
          className="absolute top-full left-1/2 z-50 mt-4 w-[min(92vw,34rem)] -translate-x-1/2 rounded-3xl border border-border/70 bg-cream p-5 shadow-premium dark:bg-surface-elevated"
          onMouseLeave={() => setOpen(false)}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-[10px] font-semibold tracking-[0.2em] text-ink-faint uppercase">
              Shop by category
            </p>
            <Link
              href="/categories"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-brand/40 hover:text-brand"
            >
              <Grid3X3 className="h-3.5 w-3.5" />
              All
            </Link>
          </div>

          <div className="grid max-h-[50vh] gap-1 overflow-y-auto sm:grid-cols-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={categoryHref(category.slug)}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-brand/5"
              >
                {category.name}
              </Link>
            ))}
            {loaded && categories.length === 0 && (
              <p className="col-span-2 px-3 py-6 text-center text-sm text-ink-muted">
                No categories yet. Add them in Admin.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
