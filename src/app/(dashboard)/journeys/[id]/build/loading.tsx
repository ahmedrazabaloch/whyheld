export default function BuilderLoading() {
  return (
    <div className="w-full animate-pulse" aria-label="Loading workspace…" aria-busy="true">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-3 pb-6">
          <div className="h-3 w-20 rounded-full bg-brand-border/30" />
          <div className="h-7 w-56 rounded-lg bg-brand-border/30" />
          <div className="h-3.5 w-80 rounded-full bg-brand-border/20" />
        </div>
        <div className="h-4 w-12 rounded-full bg-brand-border/30" />
      </div>

      <div className="rounded-[2rem] border border-brand-border/20 bg-brand-card p-6 sm:p-8 min-h-[400px]">
        <div className="h-8 w-64 rounded-lg bg-brand-border/30 mb-8" />
        <div className="space-y-4">
          <div className="h-14 w-full rounded-xl bg-brand-border/20" />
          <div className="h-14 w-full rounded-xl bg-brand-border/20" />
          <div className="h-14 w-full rounded-xl bg-brand-border/20" />
        </div>
      </div>
    </div>
  );
}
