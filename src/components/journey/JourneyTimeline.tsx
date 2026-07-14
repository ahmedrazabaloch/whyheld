import { EmptyState } from "@/components/dashboard/EmptyState";
import { JourneyStopCard } from "./JourneyStopCard";
import type { JourneyStop } from "@prisma/client";

export interface JourneyTimelineProps {
  stops: JourneyStop[];
}

export function JourneyTimeline({ stops }: JourneyTimelineProps) {
  if (!stops || stops.length === 0) {
    return (
      <EmptyState
        icon={
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        }
        title="No stops available"
        description="This journey was generated without specific stops, or generation is still pending."
      />
    );
  }

  return (
    <div>
      {stops.map((stop) => (
        <JourneyStopCard
          key={stop.id}
          order={stop.order}
          name={stop.name}
          description={stop.description || ""}
          highlights={stop.highlights || []}
        />
      ))}
    </div>
  );
}
