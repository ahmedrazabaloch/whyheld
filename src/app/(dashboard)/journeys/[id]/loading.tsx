import { surfaces } from "@/lib/design";

export default function JourneyDetailLoading() {
  return (
    <div className="animate-pulse flex flex-col gap-8">
      {/* Hero Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-4">
          <div className="h-3 w-32 rounded bg-brand-border/60"></div>
          <div className="h-8 w-64 rounded bg-brand-border/60 sm:w-96"></div>
          <div className="h-4 w-48 rounded bg-brand-border/60"></div>
        </div>
      </div>

      {/* Summary Skeleton */}
      <div className={`${surfaces.card} p-6 sm:p-8`}>
        <div className="h-6 w-48 rounded bg-brand-border/60 mb-6"></div>
        
        <div className="space-y-3 mb-8">
          <div className="h-4 w-full rounded bg-brand-border/60"></div>
          <div className="h-4 w-11/12 rounded bg-brand-border/60"></div>
          <div className="h-4 w-4/5 rounded bg-brand-border/60"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-brand-border/60">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="h-3 w-20 rounded bg-brand-border/60 mb-3"></div>
              <div className="h-6 w-32 rounded bg-brand-border/60"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Skeleton */}
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`${surfaces.card} overflow-hidden p-6 sm:p-8 relative`}>
            <div className="absolute top-0 left-0 w-1 h-full bg-brand-border/40" />
            
            <div className="mb-6 space-y-3">
              <div className="h-3 w-16 rounded bg-brand-border/60"></div>
              <div className="h-6 w-48 rounded bg-brand-border/60"></div>
            </div>
            
            <div className="space-y-2 mb-6">
              <div className="h-4 w-full rounded bg-brand-border/60"></div>
              <div className="h-4 w-5/6 rounded bg-brand-border/60"></div>
            </div>

            <div className="pt-6 border-t border-brand-border/60 space-y-3">
              <div className="h-3 w-24 rounded bg-brand-border/60 mb-3"></div>
              <div className="flex gap-2">
                <div className="h-6 w-20 rounded-full bg-brand-border/60"></div>
                <div className="h-6 w-24 rounded-full bg-brand-border/60"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
