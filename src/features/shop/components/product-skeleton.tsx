import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ProductSkeletonProps {
  view?: 'grid' | 'list';
}

export function ProductSkeleton({ view = 'grid' }: ProductSkeletonProps) {
  if (view === 'list') {
    return (
      <div className="flex gap-5 rounded-3xl border border-border/60 bg-surface-elevated p-4">
        <Skeleton className="h-36 w-28 shrink-0 sm:h-44 sm:w-36" />
        <div className="flex flex-1 flex-col justify-center gap-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Skeleton className="aspect-[3/4] w-full rounded-3xl" />
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

export function ProductGridSkeleton({
  count = 12,
  view = 'grid',
}: {
  count?: number;
  view?: 'grid' | 'list';
}) {
  if (view === 'list') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <ProductSkeleton key={i} view="list" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-5 md:gap-8 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}

export function PageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('section-padding pt-8', className)}>
      <div className="container-premium space-y-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-80 rounded-3xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
