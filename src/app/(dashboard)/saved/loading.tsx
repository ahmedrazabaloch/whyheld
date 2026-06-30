export default function SavedLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-label="Loading saved places…" aria-busy="true">
      {/* Header */}
      <div className="space-y-3 pb-6 border-b border-brand-border/20">
        <div className="h-3 w-16 rounded-full bg-brand-border/30" />
        <div className="h-7 w-36 rounded-lg bg-brand-border/30" />
        <div className="h-3.5 w-80 rounded-full bg-brand-border/20" />
      </div>
      {/* Empty state card skeleton */}
      <div className="rounded-[2rem] border border-brand-border/20 bg-brand-card p-8">
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="h-14 w-14 rounded-full bg-brand-border/25" />
          <div className="h-5 w-40 rounded-lg bg-brand-border/30" />
          <div className="space-y-2 text-center">
            <div className="h-3 w-72 rounded-full bg-brand-border/20" />
            <div className="h-3 w-56 rounded-full bg-brand-border/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
