import { Skeleton } from '@/components/ui/skeleton';

export default function ProductLoading() {
  return (
    <div className="pb-24 lg:pb-16">
      <div className="container-premium pt-6">
        <Skeleton className="mb-8 h-4 w-72 max-w-full" />

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] lg:gap-12">
          <div className="w-full max-w-xl justify-self-center space-y-4 lg:justify-self-start">
            <Skeleton className="aspect-square max-h-[620px] w-full rounded-4xl sm:aspect-[4/5]" />
            <div className="flex gap-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-[72px] w-[72px] rounded-xl sm:h-20 sm:w-20" />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-3 pt-4">
              <Skeleton className="h-12 flex-1 rounded-xl" />
              <Skeleton className="h-12 flex-1 rounded-xl" />
              <Skeleton className="h-12 w-14 rounded-xl" />
            </div>
            <Skeleton className="h-28 w-full rounded-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
