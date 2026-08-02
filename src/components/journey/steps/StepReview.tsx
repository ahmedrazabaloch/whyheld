"use client";

import Link from "next/link";
import { buttonStyles } from "@/lib/design";
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

  const comfortLine = (() => {
    switch (data.budget) {
      case "MODEST":
        return "Comfort shows up quietly here — thoughtful stays, local tables, and simple character.";
      case "COMFORTABLE":
        return "Comfort matters, but not at the expense of character.";
      case "PREMIUM":
        return "A little more comfort, with room for experiences that linger.";
      case "LUXURY":
        return "Exceptional comfort and privacy, chosen with care.";
      default:
        return null;
    }
  })();

  if (comfortLine) {
    body.push(comfortLine);
  }

  return { destination, body };
}

export function StepReview({
  controller,
  onGenerate,
  userCredits = 0,
  userPlan = "FREE",
  canBegin = false,
}: {
  controller: ReturnType<typeof useJourneyBuilder>;
  onGenerate?: () => void;
  userCredits?: number;
  userPlan?: string;
  canBegin?: boolean;
}) {
  const { data, flushSave } = controller;

  const handleBegin = () => {
    flushSave();
    if (onGenerate) {
      onGenerate();
    }
  };

  const narrative = buildNarrative(data);

  return (
    <section
      id="setup-review"
      className="scroll-mt-[var(--setup-scroll-margin,7.5rem)] space-y-8"
    >
      <div className="space-y-3">
        <h2 className="font-display text-2xl font-light tracking-tight text-brand-text-primary sm:text-[1.75rem]">
          A quiet look before we begin.
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-brand-text-secondary">
          Everything above shapes the journey. You can scroll up to change any
          of it.
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

      <div className="space-y-5 pt-4">
        <p className="max-w-sm text-sm leading-relaxed text-brand-text-secondary">
          Nothing is set in stone.
          <br />
          You&apos;ll be able to shape this journey as it unfolds.
        </p>

        {userPlan !== "PREMIUM" && userCredits <= 0 ? (
          <Link href="/billing" className={buttonStyles.primary}>
            Choose a Plan
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleBegin}
            disabled={!canBegin}
            className={buttonStyles.primary}
          >
            Begin Exploring
          </button>
        )}
      </div>
    </section>
  );
}
