import Link from "next/link";
import { surfaces } from "@/lib/design";
import { JourneyActionMenu } from "./JourneyActionMenu";

export interface JourneyListCardProps {
  id: string;
  title: string;
  destination: string;
  duration: string;
  status: string;
  stopCount: number;
  updatedDate: string;
}

export function JourneyListCard({
  id,
  title,
  destination,
  duration,
  status,
  stopCount,
  updatedDate,
}: JourneyListCardProps) {
  return (
    <div className={`${surfaces.card} relative p-6 transition-all duration-200 hover:shadow-md flex flex-col h-full group cursor-pointer`}>
      <Link
        href={`/journeys/${id}`}
        className="absolute inset-0 z-0"
        aria-label={`View ${title}`}
      />
      <div className="flex-grow relative z-10 pointer-events-none">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <span className={`${surfaces.chip} mb-3 inline-block`}>
              {status}
            </span>
            <h3 className="font-display text-xl tracking-tight text-brand-text-primary group-hover:text-brand-btn-primary transition-colors line-clamp-2">
              {title}
            </h3>
          </div>
          <div className="pointer-events-auto">
            <JourneyActionMenu id={id} currentTitle={title} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-brand-text-secondary mt-6">
          <div>
            <span className="block text-[0.65rem] font-medium uppercase tracking-[0.2em] opacity-80 mb-1">
              Destination
            </span>
            <span className="truncate block" title={destination}>
              {destination}
            </span>
          </div>
          <div>
            <span className="block text-[0.65rem] font-medium uppercase tracking-[0.2em] opacity-80 mb-1">
              Duration
            </span>
            {duration}
          </div>
          <div>
            <span className="block text-[0.65rem] font-medium uppercase tracking-[0.2em] opacity-80 mb-1">
              Stops
            </span>
            {stopCount} {stopCount === 1 ? "stop" : "stops"}
          </div>
          <div>
            <span className="block text-[0.65rem] font-medium uppercase tracking-[0.2em] opacity-80 mb-1">
              Updated
            </span>
            {updatedDate}
          </div>
        </div>
      </div>
    </div>
  );
}
