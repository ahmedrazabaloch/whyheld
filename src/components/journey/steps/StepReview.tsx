"use client";

import { differenceInCalendarDays } from "date-fns";
import type { ReactNode } from "react";
import {
  MapPin,
  CalendarDays,
  Leaf,
  Compass,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { feelingLabels } from "@/lib/journey/feelings";
import { BookSuggestionPrompt } from "@/components/journey/BookSuggestionPrompt";
import type { useJourneyBuilder } from "@/hooks/useJourneyBuilder";

function formatDateRange(
  start: Date | null,
  end: Date | null,
  durationDays: number | null,
): { dates: string; daysBadge: string | null } {
  if (start && end) {
    const fmt = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const days = Math.max(1, differenceInCalendarDays(end, start) + 1);
    return {
      dates: `${fmt.format(start)} – ${fmt.format(end)}`,
      daysBadge: `${days} ${days === 1 ? "day" : "days"}`,
    };
  }
  if (durationDays) {
    return {
      dates: `About ${durationDays} ${durationDays === 1 ? "day" : "days"}`,
      daysBadge: `${durationDays} ${durationDays === 1 ? "day" : "days"}`,
    };
  }
  return { dates: "Not set yet", daysBadge: null };
}

function ReviewRow({
  Icon,
  label,
  children,
}: {
  Icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3.5">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-border/80 bg-white text-brand-btn-primary">
        <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      </span>
      <div className="min-w-0 space-y-1">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-brand-btn-primary">
          {label}
        </p>
        <div className="text-[0.95rem] leading-relaxed text-brand-text-primary">
          {children}
        </div>
      </div>
    </div>
  );
}

function LeafSprig({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 28"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M32 26c0-8 4-14 12-18"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M32 26c0-8-4-14-12-18"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M40 12c4-1 7 1 8 4-4 1-7-1-8-4Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path
        d="M24 12c-4-1-7 1-8 4 4 1 7-1 8-4Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path
        d="M44 8c3-.5 5.5 1 6.5 3.5-3 .8-5.5-.8-6.5-3.5Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path
        d="M20 8c-3-.5-5.5 1-6.5 3.5 3 .8 5.5-.8 6.5-3.5Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StepReview({
  controller,
  showBookSuggestions = false,
}: {
  controller: ReturnType<typeof useJourneyBuilder>;
  /** Server-gated: true only when profile.countryCode === "US". */
  showBookSuggestions?: boolean;
}) {
  const { data } = controller;
  const destination = data.originQuery?.trim() || "Not chosen yet";
  const { dates, daysBadge } = formatDateRange(
    data.startDate,
    data.endDate,
    data.durationDays,
  );
  const feelLabels = feelingLabels(data.feelings);
  const feel =
    feelLabels.length > 0
      ? feelLabels.join(", ")
      : "Open to whatever this place offers.";

  return (
    <section
      id="setup-review"
      className="space-y-6"
      aria-labelledby="setup-review-title"
    >
      <div className="flex items-start gap-3.5 sm:gap-4">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-border bg-brand-bg text-brand-btn-primary">
          <CalendarDays className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0 space-y-1.5">
          <h2
            id="setup-review-title"
            className="font-display text-2xl font-light tracking-tight text-brand-text-primary sm:text-[1.75rem]"
          >
            A quiet look before we begin.
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-brand-text-secondary">
            Everything above shapes the journey. You can go back to change any
            of it.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-brand-border/70 bg-brand-bg/80">
        <div className="grid md:grid-cols-[minmax(0,1.35fr)_minmax(12rem,0.75fr)]">
          <div className="space-y-6 p-5 sm:p-6 md:p-7">
            <ReviewRow Icon={MapPin} label="Destination">
              {destination}
            </ReviewRow>

            <ReviewRow Icon={CalendarDays} label="Dates">
              <div className="flex flex-wrap items-center gap-2">
                <span>{dates}</span>
                {daysBadge ? (
                  <span className="inline-flex rounded-full border border-brand-border bg-white px-2.5 py-0.5 text-xs font-medium text-brand-text-secondary">
                    {daysBadge}
                  </span>
                ) : null}
              </div>
            </ReviewRow>

            <ReviewRow Icon={Leaf} label="Journey Feel">
              {feel}
            </ReviewRow>
          </div>

          <aside className="flex flex-col items-center justify-center gap-5 border-t border-brand-border/70 px-6 py-8 text-center md:border-l md:border-t-0 md:px-7">
            <span className="flex h-12 w-12 items-center justify-center rounded-full text-brand-btn-primary">
              <Compass className="h-8 w-8" strokeWidth={1.25} aria-hidden />
            </span>
            <p className="max-w-[14rem] text-sm leading-relaxed text-brand-text-secondary">
              Nothing is set in stone. You&apos;ll be able to shape this journey
              as it unfolds.
            </p>
            <LeafSprig className="h-7 w-16 text-brand-btn-primary/55" />
          </aside>
        </div>
      </div>

      {showBookSuggestions && data.originQuery?.trim() ? (
        <BookSuggestionPrompt destination={data.originQuery.trim()} />
      ) : null}
    </section>
  );
}
