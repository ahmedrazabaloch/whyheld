export default function ProfileLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-label="Loading profile…" aria-busy="true">
      {/* Header */}
      <div className="space-y-3 pb-6 border-b border-brand-border/20">
        <div className="h-3 w-20 rounded-full bg-brand-border/30" />
        <div className="h-7 w-36 rounded-lg bg-brand-border/30" />
        <div className="h-3.5 w-72 rounded-full bg-brand-border/20" />
      </div>

      <div className="space-y-6">
        {/* Personal Details card */}
        <div className="rounded-2xl border border-brand-border/20 bg-brand-card p-6 sm:p-8">
          <div className="h-5 w-36 rounded-lg bg-brand-border/30 mb-8" />
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-12">
            {/* Avatar skeleton */}
            <div className="flex flex-col items-center gap-4 flex-shrink-0">
              <div className="h-24 w-24 rounded-full bg-brand-border/30" />
              <div className="h-3 w-20 rounded-full bg-brand-border/20" />
            </div>
            {/* Fields skeleton */}
            <div className="flex-1 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {[0, 1].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-2.5 w-16 rounded-full bg-brand-border/30" />
                    <div className="h-10 w-full rounded-lg bg-brand-border/20" />
                  </div>
                ))}
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {[0, 1].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-2.5 w-16 rounded-full bg-brand-border/30" />
                    <div className="h-10 w-full rounded-lg bg-brand-border/20" />
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-4">
                <div className="h-10 w-32 rounded-full bg-brand-border/25" />
              </div>
            </div>
          </div>
        </div>

        {/* Security card */}
        <div className="rounded-2xl border border-brand-border/20 bg-brand-card p-6 sm:p-8">
          <div className="h-5 w-24 rounded-lg bg-brand-border/30 mb-8" />
          <div className="space-y-5 max-w-md">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-2.5 w-24 rounded-full bg-brand-border/30" />
                <div className="h-10 w-full rounded-lg bg-brand-border/20" />
              </div>
            ))}
            <div className="pt-2">
              <div className="h-10 w-36 rounded-full bg-brand-border/25" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
