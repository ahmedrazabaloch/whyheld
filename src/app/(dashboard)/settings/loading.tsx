export default function SettingsLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-label="Loading settings…" aria-busy="true">
      {/* Header */}
      <div className="space-y-3 pb-6 border-b border-brand-border/20">
        <div className="h-3 w-20 rounded-full bg-brand-border/30" />
        <div className="h-7 w-44 rounded-lg bg-brand-border/30" />
        <div className="h-3.5 w-72 rounded-full bg-brand-border/20" />
      </div>
      {/* Info cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-brand-border/20 bg-brand-card px-6 py-5"
          >
            <div className="h-2.5 w-16 rounded-full bg-brand-border/30" />
            <div className="mt-3 h-4 w-32 rounded-full bg-brand-border/25" />
          </div>
        ))}
      </div>
      {/* Preference chips */}
      <div>
        <div className="mb-3 h-2.5 w-36 rounded-full bg-brand-border/30" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-brand-border/20 bg-brand-card px-4 py-3"
            >
              <div className="h-2 w-12 rounded-full bg-brand-border/30" />
              <div className="mt-2 h-3 w-16 rounded-full bg-brand-border/25" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
