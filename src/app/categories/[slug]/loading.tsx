export default function CategoryLoading() {
  return (
    <div className="section-padding pt-8" aria-busy="true" aria-label="Loading category">
      <div className="container-premium space-y-8">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-muted" />
        <div className="h-40 animate-pulse rounded-3xl bg-muted" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="aspect-[3/4] animate-pulse rounded-3xl bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}
