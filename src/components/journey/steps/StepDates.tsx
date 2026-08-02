"use client";

import { DateRangePicker } from "@/components/ui/DateRangePicker";
import type { useJourneyBuilder } from "@/hooks/useJourneyBuilder";

export function StepDates({ controller }: { controller: ReturnType<typeof useJourneyBuilder> }) {
  const { data, update } = controller;

  return (
    <section
      id="setup-travel-dates"
      className="scroll-mt-[var(--setup-scroll-margin,7.5rem)] space-y-5"
    >
      <h2 className="font-display text-2xl font-light tracking-tight text-brand-text-primary sm:text-[1.75rem]">
        When would you like to travel?
      </h2>

      <div className="max-w-sm">
        <DateRangePicker
          startDate={data.startDate}
          endDate={data.endDate}
          onUpdate={(start, end) => {
            if (start !== data.startDate) update("startDate", start);
            if (end !== data.endDate) update("endDate", end);
            // Mutual exclusivity: clear duration when specific dates are selected
            if ((start || end) && data.durationDays !== null) {
              update("durationDays", null);
            }
          }}
        />
      </div>
    </section>
  );
}
