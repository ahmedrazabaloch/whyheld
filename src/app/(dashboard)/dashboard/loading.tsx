export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-label="Loading dashboard…" aria-busy="true">
      {/* Header */}
      <div className="space-y-3 pb-6 border-b border-brand-border/20">
        <div className="h-3 w-24 rounded-full bg-brand-border/30" />
        <div className="h-7 w-60 rounded-lg bg-brand-border/30" />
        <div className="h-3.5 w-80 rounded-full bg-brand-border/20" />
      </div>
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {["AI Credits", "Journeys", "Saved places"].map((label) => (
          <div
            key={label}
            className="rounded-2xl border border-brand-border/20 bg-brand-card px-6 py-5"
          >
            <div className="h-2.5 w-16 rounded-full bg-brand-border/30" />
            <div className="mt-3 h-8 w-12 rounded-lg bg-brand-border/30" />
          </div>
        ))}
      </div>
      {/* Action cards */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-brand-border/20 bg-brand-card p-6 sm:p-8"
          >
            <div className="h-5 w-44 rounded-lg bg-brand-border/30" />
            <div className="mt-3 space-y-2">
              <div className="h-3 w-full rounded-full bg-brand-border/20" />
              <div className="h-3 w-2/3 rounded-full bg-brand-border/20" />
            </div>
            <div className="mt-6 h-10 w-36 rounded-full bg-brand-border/25" />
          </div>
        ))}
      </div>
    </div>
  );
}
