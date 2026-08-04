"use client";

import { feelingLabels } from "@/lib/journey/feelings";
import type { useJourneyBuilder, JourneyData } from "@/hooks/useJourneyBuilder";

function placeName(originQuery: string | null): string {
  if (!originQuery) return "";
  return originQuery.split(",")[0]?.trim() || originQuery;
}

function buildNarrative(data: JourneyData): {
  destination: string;
  body: string[];
} {
  const place = placeName(data.originQuery);
  const destination = place
    ? `You're setting out for ${place}.`
    : "A destination is still waiting to be chosen.";

  const body: string[] = [];

  const paceLine = (() => {
    switch (data.pace) {
      case "ONE_PLACE_DEEPLY":
        return "You've chosen to settle into one place deeply, with room for it to unfold completely.";
      case "SLOW_UNHURRIED":
        return "You've chosen a slower pace with enough time to let each place unfold naturally.";
      case "GENTLY_BALANCED":
        return "You've chosen a gently balanced rhythm — some movement, and plenty of stillness.";
      default:
        return null;
    }
  })();

  const timeLine = (() => {
    if (data.startDate && data.endDate) {
      const fmt = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return `Your days fall between ${fmt.format(data.startDate)} and ${fmt.format(data.endDate)}.`;
    }
    if (data.durationDays) {
      return `You're giving this journey about ${data.durationDays} days.`;
    }
    return null;
  })();

  if (paceLine && timeLine) {
    body.push(`${paceLine} ${timeLine}`);
  } else if (paceLine) {
    body.push(paceLine);
  } else if (timeLine) {
    body.push(timeLine);
  }

  const feelings = feelingLabels(data.feelings);
  if (feelings.length > 0) {
    body.push(`This journey leans toward ${feelings.join(", ").toLowerCase()}.`);
  }

  const must = data.tripShape?.mustVisit ?? [];
  if (data.tripShape?.startPoint?.name || data.tripShape?.endPoint?.name) {
    const start = data.tripShape.startPoint?.name;
    const end = data.tripShape.endPoint?.name;
    if (start && end) {
      body.push(`The path runs from ${start} toward ${end}.`);
    } else if (start) {
      body.push(`You begin in ${start}.`);
    } else if (end) {
      body.push(`You settle toward ${end}.`);
    }
  }
  if (must.length > 0) {
    body.push(
      `You've asked to include ${must.map((p) => p.name).join(", ")}.`,
    );
  }

  return { destination, body };
}

export function StepReview({
  controller,
}: {
  controller: ReturnType<typeof useJourneyBuilder>;
}) {
  const { data } = controller;
  const narrative = buildNarrative(data);

  return (
    <section id="setup-review" className="space-y-8" aria-labelledby="setup-review-title">
      <div className="space-y-3">
        <h2
          id="setup-review-title"
          className="font-display text-2xl font-light tracking-tight text-brand-text-primary sm:text-[1.75rem]"
        >
          A quiet look before we begin.
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-brand-text-secondary">
          Everything above shapes the journey. You can go back to change any of
          it.
        </p>
      </div>

      <div className="max-w-xl space-y-5 border-l border-brand-btn-primary/30 pl-5 sm:pl-6">
        <p className="font-display text-2xl font-light leading-snug tracking-tight text-brand-text-primary sm:text-[1.65rem]">
          {narrative.destination}
        </p>
        {narrative.body.map((line) => (
          <p
            key={line}
            className="text-base font-light leading-relaxed text-brand-text-secondary sm:text-lg"
          >
            {line}
          </p>
        ))}
      </div>

      <div className="pt-2">
        <p className="max-w-sm text-sm leading-relaxed text-brand-text-secondary">
          Nothing is set in stone.
          <br />
          You&apos;ll be able to shape this journey as it unfolds.
        </p>
      </div>
    </section>
  );
}
