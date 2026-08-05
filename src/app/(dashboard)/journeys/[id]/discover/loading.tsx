import { DiscoveryPlaceSkeleton } from "@/components/discovery/DiscoveryPlaceCard";

export default function DiscoveryLoading() {
  return (
    <div
      className="w-full animate-pulse"
      aria-busy="true"
      aria-label="Opening discovery"
    >
      <div className="mb-10 sm:mb-12">
        <div className="mb-3 h-3 w-24 rounded bg-brand-border/50" />
        <div className="h-12 w-2/3 max-w-sm rounded bg-brand-border/40 sm:h-14" />
      </div>

      <div className="max-w-2xl space-y-4 border-l border-brand-border/40 pl-5 sm:pl-6">
        <div className="h-4 w-full rounded bg-brand-border/35" />
        <div className="h-4 w-11/12 rounded bg-brand-border/35" />
        <div className="h-4 w-4/5 rounded bg-brand-border/35" />
        <div className="h-4 w-5/6 rounded bg-brand-border/35" />
      </div>

      <div className="my-12 flex items-center gap-4 sm:my-14">
        <span className="h-px flex-1 bg-brand-border/50" />
        <div className="h-3 w-40 rounded bg-brand-border/40" />
        <span className="h-px flex-1 bg-brand-border/50" />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <DiscoveryPlaceSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
