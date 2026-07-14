import { Skeleton } from '@/components/ui/skeleton';

export function TrackingPageSkeleton() {
  return (
    <div className="section-padding pt-8">
      <div className="container-premium space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="h-48 w-full rounded-3xl" />
            <Skeleton className="h-96 w-full rounded-3xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-56 w-full rounded-3xl" />
            <Skeleton className="h-48 w-full rounded-3xl" />
            <Skeleton className="h-40 w-full rounded-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
