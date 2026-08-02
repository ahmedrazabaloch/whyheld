"use client";

import { LocationAutocomplete } from "@/components/location/LocationAutocomplete";
import type { useJourneyBuilder } from "@/hooks/useJourneyBuilder";

export function StepDestination({ controller }: { controller: ReturnType<typeof useJourneyBuilder> }) {
  const { data, update } = controller;

  return (
    <section
      id="setup-destination"
      className="scroll-mt-[var(--setup-scroll-margin,7.5rem)] space-y-5"
    >
      <h2 className="font-display text-2xl font-light tracking-tight text-brand-text-primary sm:text-[1.75rem]">
        Where are you feeling called?
      </h2>

      <LocationAutocomplete
        label="Destination"
        placeholder="e.g. Kyoto, Japan or The Scottish Highlands"
        value={data.originQuery || ""}
        onChange={(_placeId, desc) => {
          update("originQuery", desc);
          if (data.title === "Untitled Journey") {
            update("title", `Journey to ${desc.split(",")[0]}`);
          }
        }}
      />

      <p className="max-w-md text-sm leading-relaxed text-brand-text-secondary">
        Start with a place that&apos;s been on your mind.
        The rest can unfold from there.
      </p>
    </section>
  );
}
