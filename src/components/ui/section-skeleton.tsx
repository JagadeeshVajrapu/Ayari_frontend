export function SectionSkeleton({ height = 'h-96' }: { height?: string }) {
  return (
    <div className={`section-padding ${height} animate-pulse bg-muted/30`} aria-hidden="true">
      <div className="container-premium">
        <div className="mb-8 h-8 w-48 rounded-xl bg-muted" />
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-3xl bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}
