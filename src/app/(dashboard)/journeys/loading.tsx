export default function JourneysLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-label="Loading journeys…" aria-busy="true">
      {/* Header with action button */}
      <div className="flex items-start justify-between pb-6 border-b border-brand-border/20">
        <div className="space-y-3">
          <div className="h-3 w-20 rounded-full bg-brand-border/30" />
          <div className="h-7 w-40 rounded-lg bg-brand-border/30" />
          <div className="h-3.5 w-72 rounded-full bg-brand-border/20" />
        </div>
        <div className="h-10 w-32 rounded-full bg-brand-border/25 flex-shrink-0" />
      </div>
      {/* Content card */}
      <div className="rounded-[2rem] border border-brand-border/20 bg-brand-card p-8">
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="h-14 w-14 rounded-full bg-brand-border/25" />
          <div className="h-5 w-36 rounded-lg bg-brand-border/30" />
          <div className="space-y-2 text-center">
            <div className="h-3 w-64 rounded-full bg-brand-border/20" />
            <div className="h-3 w-48 rounded-full bg-brand-border/20" />
          </div>
          <div className="mt-2 h-10 w-44 rounded-full bg-brand-border/25" />
        </div>
      </div>
    </div>
  );
}
