export default function BillingLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-label="Loading billing…" aria-busy="true">
      {/* Header */}
      <div className="space-y-3 pb-6 border-b border-brand-border/20">
        <div className="h-3 w-16 rounded-full bg-brand-border/30" />
        <div className="h-7 w-44 rounded-lg bg-brand-border/30" />
        <div className="h-3.5 w-80 rounded-full bg-brand-border/20" />
      </div>
      {/* Credit balance card */}
      <div className="rounded-[2rem] border border-brand-border/20 bg-brand-card p-6 sm:p-8">
        <div className="h-2.5 w-24 rounded-full bg-brand-border/30" />
        <div className="mt-3 h-10 w-16 rounded-lg bg-brand-border/30" />
        <div className="mt-4 flex gap-6">
          <div className="h-3 w-20 rounded-full bg-brand-border/20" />
          <div className="h-3 w-16 rounded-full bg-brand-border/20" />
        </div>
      </div>
      {/* Subscription empty state skeleton */}
      <div className="rounded-[2rem] border border-brand-border/20 bg-brand-card p-8">
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="h-14 w-14 rounded-full bg-brand-border/25" />
          <div className="h-5 w-60 rounded-lg bg-brand-border/30" />
          <div className="space-y-2 text-center">
            <div className="h-3 w-80 rounded-full bg-brand-border/20" />
            <div className="h-3 w-64 rounded-full bg-brand-border/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
