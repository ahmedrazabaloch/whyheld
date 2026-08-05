"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Pencil, Star, Trash2 } from "lucide-react";
import { surfaces } from "@/lib/design";
import type { ComposedJourney } from "@/lib/ai/schemas/composed-journey";
import type { DiscoveryPlace } from "@/components/discovery/discovery-data";
import { saveComposedJourneyEdits } from "@/actions/journey-actions";
import {
  dayDetailBullets,
  dayNarrativeSummary,
  normalizeComposedJourney,
} from "@/lib/utils/composed-journey";
import {
  addPlaceToDay,
  availableDiscoveryPlaces,
  movePlaceToDay,
  removeDayFromJourney,
  removePlaceFromDay,
  reorderPlaceInDay,
  togglePlaceLock,
} from "@/components/journey/composed-edit";
import {
  DayPlaceEditor,
  JourneyEditToolbar,
} from "@/components/journey/DayPlaceEditor";
import type { JourneyAccessInfo } from "@/lib/journey/load-access";
import { AppDialog } from "@/components/ui/AppDialog";

type Props = {
  composed: ComposedJourney;
  /** All Discovery places selected for the journey (for Add place). */
  discoveryPlaces: DiscoveryPlace[];
  destination: string;
  journeyId: string;
  initialEditMode?: boolean;
  accessInfo?: JourneyAccessInfo | null;
};

function dayAnchorId(dayNumber: number) {
  return `journey-day-${dayNumber}`;
}

const PACING_TAG_TONES = [
  "border-[#74876B]/30 bg-[#74876B]/12 text-[#4f5d49]",
  "border-sky-700/20 bg-sky-50 text-sky-900/75",
  "border-amber-700/20 bg-amber-50 text-amber-950/75",
  "border-stone-400/40 bg-stone-100 text-stone-700",
  "border-teal-700/20 bg-teal-50 text-teal-900/75",
] as const;

/** Split pacing copy into short visual tags. */
function pacingTags(pacing: string): string[] {
  return pacing
    .split(/\s*[—–|]\s*|\s*,\s*/)
    .map((part) => part.replace(/^recommended pacing\s*[—–-]?\s*/i, "").trim())
    .filter((part) => part.length > 0);
}

function dayPlaceEntries(day: {
  places?: Array<{ id?: string; title: string; city?: string | null; locked?: boolean }>;
  placeTitles?: string[];
  city?: string | null;
}) {
  if (day.places && day.places.length > 0) return day.places;
  if (day.placeTitles && day.placeTitles.length > 0) {
    return day.placeTitles.map((title) => ({
      id: title,
      title,
      locked: false as const,
      city: day.city,
    }));
  }
  return [];
}

/**
 * Premium reading layout for a composed itinerary,
 * with an optional Edit Mode for place-level control.
 */
export function ComposedJourneySections({
  composed: composedProp,
  discoveryPlaces,
  destination,
  journeyId,
  initialEditMode = false,
  accessInfo = null,
}: Props) {
  const router = useRouter();
  const baseline = useMemo(
    () =>
      normalizeComposedJourney(composedProp, {
        fallbackCountry: destination,
      }),
    [composedProp, destination],
  );
  const [draft, setDraft] = useState<ComposedJourney>(baseline);
  const [baselineSnapshot, setBaselineSnapshot] = useState(baseline);
  const [editMode, setEditMode] = useState(initialEditMode);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [regeneratingDay, setRegeneratingDay] = useState<number | null>(null);

  // Sync from server when props change and there are no local edits (React-approved render adjustment).
  const dirty =
    JSON.stringify(draft) !== JSON.stringify(baselineSnapshot);
  if (baseline !== baselineSnapshot && !dirty) {
    setBaselineSnapshot(baseline);
    setDraft(baseline);
  }

  const days = draft.days;
  const totalDays = days.length;
  const [activeDay, setActiveDay] = useState(days[0]?.dayNumber ?? 1);
  const dayButtonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const dayNavScrollRef = useRef<HTMLDivElement>(null);
  const scrollingToRef = useRef<number | null>(null);
  const [removingDay, setRemovingDay] = useState<number | null>(null);
  const [dayToRemove, setDayToRemove] = useState<number | null>(null);

  const availablePlaces = useMemo(
    () => availableDiscoveryPlaces(draft, discoveryPlaces),
    [draft, discoveryPlaces],
  );

  const allDayNumbers = useMemo(
    () => days.map((d) => d.dayNumber),
    [days],
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await saveComposedJourneyEdits(journeyId, draft);
      if (!res.success) {
        setSaveError(res.error || "Could not save changes.");
        return;
      }
      setBaselineSnapshot(draft);
      router.refresh();
    } catch {
      setSaveError("Could not save changes.");
    } finally {
      setSaving(false);
    }
  }, [draft, journeyId, router]);

  const handleRegenerateDay = useCallback(
    async (dayNumber: number) => {
      if (accessInfo && !accessInfo.canRegenerate) {
        setSaveError(
          accessInfo.gateMessage ||
            "This journey cannot be regenerated right now.",
        );
        return;
      }
      // Persist current draft first so the API regenerates from latest places
      setRegeneratingDay(dayNumber);
      setSaveError(null);
      try {
        if (dirty) {
          const saved = await saveComposedJourneyEdits(journeyId, draft);
          if (!saved.success) {
            setSaveError(saved.error || "Save failed before regenerate.");
            return;
          }
        }

        const res = await fetch(`/api/v1/journeys/${journeyId}/regenerate-day`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dayNumber }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          composed?: ComposedJourney;
        };
        if (!res.ok) {
          setSaveError(data.error || "Could not regenerate this day.");
          return;
        }
        if (data.composed) {
          const next = normalizeComposedJourney(data.composed, {
            fallbackCountry: destination,
          });
          setDraft(next);
          setBaselineSnapshot(next);
        }
        router.refresh();
      } catch {
        setSaveError("Could not regenerate this day.");
      } finally {
        setRegeneratingDay(null);
      }
    },
    [accessInfo, destination, dirty, draft, journeyId, router],
  );

  const handleRemoveDay = useCallback(
    async (dayNumber: number) => {
      if (draft.days.length <= 1) {
        setSaveError("A journey needs at least one day.");
        return;
      }

      const previous = draft;
      const next = removeDayFromJourney(draft, dayNumber);
      setDraft(next);
      setEditMode(true);
      setRemovingDay(dayNumber);
      setSaveError(null);
      try {
        const res = await saveComposedJourneyEdits(journeyId, next);
        if (!res.success) {
          setSaveError(res.error || "Could not remove this day.");
          setDraft(previous);
          return;
        }
        setBaselineSnapshot(next);
        setActiveDay(next.days[0]?.dayNumber ?? 1);
        router.refresh();
      } catch {
        setSaveError("Could not remove this day.");
        setDraft(previous);
      } finally {
        setRemovingDay(null);
      }
    },
    [draft, journeyId, router],
  );

  const requestRemoveDay = useCallback(
    (dayNumber: number) => {
      if (draft.days.length <= 1) {
        setSaveError("A journey needs at least one day.");
        return;
      }
      setDayToRemove(dayNumber);
    },
    [draft.days.length],
  );

  const scrollDayNav = useCallback((direction: "left" | "right") => {
    const el = dayNavScrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === "left" ? -220 : 220,
      behavior: "smooth",
    });
  }, []);

  // Track which day is in view while scrolling
  useEffect(() => {
    const elements = days
      .map((d) => document.getElementById(dayAnchorId(d.dayNumber)))
      .filter((el): el is HTMLElement => !!el);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollingToRef.current !== null) return;

        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const top = visible[0];
        if (!top?.target.id) return;
        const match = top.target.id.match(/^journey-day-(\d+)$/);
        if (!match) return;
        const dayNum = Number(match[1]);
        if (!Number.isNaN(dayNum)) setActiveDay(dayNum);
      },
      {
        root: null,
        rootMargin: "-30% 0px -45% 0px",
        threshold: [0, 0.15, 0.35, 0.55],
      },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [days]);

  // Keep the active day chip visible in the horizontal nav
  useEffect(() => {
    dayButtonRefs.current.get(activeDay)?.scrollIntoView({
      behavior: "smooth",
      inline: "nearest",
      block: "nearest",
    });
  }, [activeDay]);

  const scrollToDay = useCallback((dayNumber: number) => {
    const el = document.getElementById(dayAnchorId(dayNumber));
    if (!el) return;

    setActiveDay(dayNumber);
    scrollingToRef.current = dayNumber;
    el.scrollIntoView({ behavior: "smooth", block: "start" });

    window.setTimeout(() => {
      if (scrollingToRef.current === dayNumber) {
        scrollingToRef.current = null;
      }
    }, 900);
  }, []);

  const handleEditDay = useCallback(
    (dayNumber: number) => {
      setEditMode(true);
      setSaveError(null);
      window.requestAnimationFrame(() => scrollToDay(dayNumber));
    },
    [scrollToDay],
  );

  const onDayNavKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>, dayNumber: number) => {
      const index = days.findIndex((d) => d.dayNumber === dayNumber);
      if (index < 0) return;

      let nextIndex: number | null = null;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        nextIndex = Math.min(index + 1, days.length - 1);
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        nextIndex = Math.max(index - 1, 0);
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = days.length - 1;
      }

      if (nextIndex === null || nextIndex === index) return;
      event.preventDefault();
      const nextDay = days[nextIndex]!.dayNumber;
      dayButtonRefs.current.get(nextDay)?.focus();
      scrollToDay(nextDay);
    },
    [days, scrollToDay],
  );

  const activeIndex = Math.max(
    1,
    days.findIndex((d) => d.dayNumber === activeDay) + 1,
  );

  return (
    <div className="mt-10 sm:mt-12">
      {editMode ? (
        <JourneyEditToolbar
          dirty={dirty}
          saving={saving || regeneratingDay !== null || removingDay !== null}
          onSave={() => void handleSave()}
          onCancel={() => {
            setDraft(baselineSnapshot);
            setSaveError(null);
          }}
          onExitEdit={() => {
            setEditMode(false);
            setSaveError(null);
            router.replace(`/journeys/${journeyId}`);
          }}
          accessLabel={
            accessInfo
              ? accessInfo.plan === "PREMIUM"
                ? accessInfo.accessExpiresLabel
                  ? `Adjust until ${accessInfo.accessExpiresLabel}`
                  : "Premium refinements"
                : `${accessInfo.refinementsRemaining} of ${accessInfo.maxRefinements} refinements left${
                    accessInfo.accessExpiresLabel
                      ? ` · until ${accessInfo.accessExpiresLabel}`
                      : ""
                  }`
              : null
          }
          accessBlockedMessage={
            accessInfo && !accessInfo.canRegenerate
              ? accessInfo.gateMessage
              : null
          }
        />
      ) : null}

      {!editMode && accessInfo ? (
        <p className="mb-6 text-xs tracking-wide text-brand-text-secondary">
          {accessInfo.plan === "PREMIUM"
            ? accessInfo.accessExpiresLabel
              ? `Adjustment window open until ${accessInfo.accessExpiresLabel}.`
              : "Premium — regenerate freely within the access window."
            : `${accessInfo.refinementsRemaining} of ${accessInfo.maxRefinements} refinements remaining${
                accessInfo.accessExpiresLabel
                  ? ` · until ${accessInfo.accessExpiresLabel}`
                  : ""
              }.`}
        </p>
      ) : null}

      {saveError ? (
        <p className="mb-4 text-sm text-brand-btn-primary" role="alert">
          {saveError}
        </p>
      ) : null}

      {/* Sticky day navigation + reading progress */}
      <nav
        aria-label="Day navigation"
        className="sticky top-14 z-20 -mx-4 mb-10 border-b border-brand-border/50 bg-brand-bg/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:mb-12 sm:px-6 lg:top-0 lg:-mx-8 lg:px-8"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <button
              type="button"
              onClick={() => scrollDayNav("left")}
              aria-label="Scroll days backward"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-border/70 bg-brand-card text-brand-text-secondary transition-colors hover:border-brand-text-secondary hover:text-brand-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
            </button>

            <div
              ref={dayNavScrollRef}
              role="list"
              className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto scroll-smooth pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              onKeyDown={(e) => {
                const target = e.target as HTMLElement;
                const dayAttr = target.getAttribute("data-day");
                if (dayAttr) onDayNavKeyDown(e, Number(dayAttr));
              }}
            >
              {days.map((day) => {
                const isActive = day.dayNumber === activeDay;
                return (
                  <button
                    key={day.dayNumber}
                    type="button"
                    role="listitem"
                    data-day={day.dayNumber}
                    ref={(node) => {
                      if (node) dayButtonRefs.current.set(day.dayNumber, node);
                      else dayButtonRefs.current.delete(day.dayNumber);
                    }}
                    aria-current={isActive ? "true" : undefined}
                    aria-label={`Go to day ${day.dayNumber}${day.theme ? `: ${day.theme}` : ""}`}
                    onClick={() => scrollToDay(day.dayNumber)}
                    className={[
                      "shrink-0 rounded-full px-3.5 py-2 text-xs font-medium tracking-wide",
                      "transition-colors duration-200",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary",
                      isActive
                        ? "bg-brand-btn-primary text-brand-bg"
                        : "bg-brand-card text-brand-text-secondary hover:text-brand-text-primary border border-brand-border/60",
                    ].join(" ")}
                  >
                    Day {day.dayNumber}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => scrollDayNav("right")}
              aria-label="Scroll days forward"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-border/70 bg-brand-card text-brand-text-secondary transition-colors hover:border-brand-text-secondary hover:text-brand-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>

          <p
            className="shrink-0 text-xs tracking-wide text-brand-text-secondary"
            aria-live="polite"
            aria-atomic="true"
          >
            Reading Day{" "}
            <span className="font-medium text-brand-text-primary">{activeIndex}</span>
            {" of "}
            <span className="font-medium text-brand-text-primary">{totalDays}</span>
          </p>
        </div>
      </nav>

      <div className="space-y-16 sm:space-y-20">
        {/* Daily itinerary */}
        <section aria-labelledby="daily-itinerary-heading">
          <header className="mb-10 sm:mb-12">
            <p className="mb-2 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-brand-text-secondary/80">
              Daily itinerary
            </p>
            <h2
              id="daily-itinerary-heading"
              className="font-display text-2xl text-brand-text-primary sm:text-3xl"
            >
              Your days, unhurried
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-brand-text-secondary">
              One calm summary per day — shaped only from the places you chose.
            </p>
          </header>

          <div className="space-y-14 sm:space-y-16">
            {days.map((day) => (
              <article
                key={day.dayNumber}
                id={dayAnchorId(day.dayNumber)}
                className={`${surfaces.card} scroll-mt-32 overflow-hidden p-6 sm:p-8 lg:scroll-mt-24 lg:p-10`}
                aria-labelledby={`day-${day.dayNumber}-title`}
              >
                <header className="mb-8 border-b border-brand-border/50 pb-6 sm:mb-10 sm:pb-8">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-col gap-2">
                      <span className="inline-flex w-fit rounded-full border border-brand-btn-primary/30 bg-brand-btn-primary/10 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-brand-btn-primary">
                        Day {day.dayNumber}
                      </span>
                      {day.theme ? (
                        <h3
                          id={`day-${day.dayNumber}-title`}
                          className="font-display text-xl font-light tracking-tight text-brand-text-primary sm:text-2xl"
                        >
                          {day.theme}
                        </h3>
                      ) : (
                        <h3
                          id={`day-${day.dayNumber}-title`}
                          className="sr-only"
                        >
                          Day {day.dayNumber}
                        </h3>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditDay(day.dayNumber)}
                        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-brand-border bg-brand-bg/50 px-3 text-xs font-medium text-brand-text-secondary transition-colors hover:border-brand-text-secondary hover:text-brand-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary"
                      >
                        <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={days.length <= 1 || removingDay === day.dayNumber}
                        onClick={() => requestRemoveDay(day.dayNumber)}
                        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-brand-border bg-brand-bg/50 px-3 text-xs font-medium text-brand-text-secondary transition-colors hover:border-red-700/40 hover:text-red-800/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                        {removingDay === day.dayNumber ? "Removing…" : "Remove"}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="font-display text-2xl font-semibold tracking-tight text-brand-btn-primary sm:text-3xl">
                      {day.city?.trim() ? (
                        <>
                          <span>{day.city.trim()}</span>
                          <span className="mx-2 font-sans text-lg font-light text-brand-btn-primary/45">
                            ·
                          </span>
                          <span>{day.country?.trim() || destination}</span>
                        </>
                      ) : (
                        <span>{day.country?.trim() || destination}</span>
                      )}
                    </p>

                    {dayPlaceEntries(day).length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {dayPlaceEntries(day).map((place) => (
                          <span
                            key={place.id ?? place.title}
                            className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-brand-border/70 bg-brand-bg px-3 py-1.5 text-xs font-medium text-brand-text-primary sm:text-[0.8rem]"
                          >
                            <span className="truncate">{place.title}</span>
                            {place.city?.trim() &&
                            place.city.trim().toLowerCase() !==
                              day.city?.trim().toLowerCase() ? (
                              <span className="truncate text-brand-text-secondary">
                                · {place.city.trim()}
                              </span>
                            ) : null}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {day.transition ? (
                    <p className="mt-4 max-w-3xl text-[0.95rem] leading-[1.75] text-brand-text-secondary sm:text-base">
                      {day.transition}
                    </p>
                  ) : null}

                  {day.pacing ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full border border-brand-border/60 bg-transparent px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary/80">
                        Recommended pacing
                      </span>
                      {pacingTags(day.pacing).map((tag, index) => (
                        <span
                          key={`${tag}-${index}`}
                          className={[
                            "inline-flex max-w-full rounded-full border px-3 py-1.5 text-[0.72rem] font-medium leading-snug",
                            PACING_TAG_TONES[index % PACING_TAG_TONES.length],
                          ].join(" ")}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {(day.ethosFlags?.tooManyPlaces ||
                    day.ethosFlags?.longDrive) && (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {day.ethosFlags.tooManyPlaces ? (
                        <li className="rounded-full border border-amber-800/25 bg-amber-50/80 px-3 py-1 text-[0.7rem] font-medium text-amber-950/80">
                          More than 3 places — consider thinning this day
                        </li>
                      ) : null}
                      {day.ethosFlags.longDrive ? (
                        <li className="rounded-full border border-amber-800/25 bg-amber-50/80 px-3 py-1 text-[0.7rem] font-medium text-amber-950/80">
                          Tiring drive
                          {typeof day.estimatedDriveHours === "number"
                            ? ` (~${day.estimatedDriveHours.toFixed(1)}h)`
                            : ""}
                        </li>
                      ) : null}
                    </ul>
                  )}
                </header>

                <div className="space-y-5">
                  <p className="max-w-3xl text-sm leading-[1.8] text-brand-text-secondary sm:text-[0.95rem]">
                    {dayNarrativeSummary(day)}
                  </p>

                  {dayDetailBullets(day).length > 0 ? (
                    <ul className="space-y-2.5">
                      {dayDetailBullets(day).map((line) => (
                        <li key={line}>
                          <span
                            className={[
                              "inline-flex max-w-full items-start gap-2.5 rounded-full border border-brand-border/70",
                              "bg-brand-bg/80 px-3.5 py-2 text-left text-xs leading-relaxed text-brand-text-primary",
                              "sm:text-[0.8rem]",
                            ].join(" ")}
                          >
                            <Star
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-btn-primary"
                              strokeWidth={1.75}
                              fill="currentColor"
                              aria-hidden
                            />
                            <span>{line}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                {day.localTips ? (
                  <TipCallout
                    className="mt-6"
                    label="Local tip"
                    body={day.localTips}
                  />
                ) : null}

                {day.weatherNote ? (
                  <TipCallout
                    className="mt-3"
                    label="Season & weather"
                    body={day.weatherNote}
                  />
                ) : null}

                {day.notes ? (
                  <TipCallout
                    className="mt-6 sm:mt-8"
                    label="Traveler note"
                    body={day.notes}
                  />
                ) : null}

                {editMode ? (
                  <DayPlaceEditor
                    day={day}
                    allDayNumbers={allDayNumbers}
                    availablePlaces={availablePlaces}
                    regenerating={regeneratingDay === day.dayNumber}
                    discoverHref={`/journeys/${journeyId}/discover?from=edit`}
                    onRemove={(placeId) =>
                      setDraft((prev) =>
                        removePlaceFromDay(prev, day.dayNumber, placeId),
                      )
                    }
                    onToggleLock={(placeId) =>
                      setDraft((prev) =>
                        togglePlaceLock(prev, day.dayNumber, placeId),
                      )
                    }
                    onReorder={(placeId, direction) =>
                      setDraft((prev) =>
                        reorderPlaceInDay(prev, day.dayNumber, placeId, direction),
                      )
                    }
                    onMove={(placeId, toDay) =>
                      setDraft((prev) =>
                        movePlaceToDay(prev, day.dayNumber, placeId, toDay),
                      )
                    }
                    onAdd={(place) =>
                      setDraft((prev) => addPlaceToDay(prev, day.dayNumber, place))
                    }
                    onRegenerateDay={() => void handleRegenerateDay(day.dayNumber)}
                  />
                ) : day.placeTitles && day.placeTitles.length > 0 ? (
                  <div className="mt-6 border-t border-brand-border/40 pt-5">
                    <p className="mb-3 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-brand-text-secondary/80">
                      Places this day
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {day.placeTitles.map((title) => (
                        <span
                          key={title}
                          className="inline-flex max-w-full rounded-full border border-brand-btn-primary/25 bg-brand-btn-primary/10 px-3 py-1.5 text-[0.72rem] font-medium leading-snug text-brand-btn-primary"
                        >
                          {title}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        {/* Journey notes */}
        {draft.notes ? (
          <section
            aria-labelledby="journey-notes-heading"
            className={`${surfaces.card} p-6 sm:p-8 lg:p-10`}
          >
            <p className="mb-2 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-brand-text-secondary/80">
              Journey notes
            </p>
            <h2
              id="journey-notes-heading"
              className="mb-5 font-display text-2xl text-brand-text-primary sm:mb-6 sm:text-3xl"
            >
              A few quiet reminders
            </h2>
            <TipCallout label="Notes" body={draft.notes} />
          </section>
        ) : null}
      </div>

      <AppDialog
        open={dayToRemove !== null}
        title="Remove this day?"
        description={
          dayToRemove !== null
            ? `Day ${dayToRemove} will be removed from this journey. You can still edit other days afterward.`
            : undefined
        }
        tone="danger"
        confirmLabel="Remove day"
        cancelLabel="Keep day"
        busy={removingDay !== null}
        onClose={() => {
          if (removingDay === null) setDayToRemove(null);
        }}
        onConfirm={() => {
          if (dayToRemove === null) return;
          const dayNumber = dayToRemove;
          setDayToRemove(null);
          void handleRemoveDay(dayNumber);
        }}
      />
    </div>
  );
}

function TipCallout({
  label,
  body,
  className = "",
}: {
  label: string;
  body: string;
  className?: string;
}) {
  return (
    <aside
      className={[
        "rounded-2xl border border-brand-btn-primary/20 bg-brand-btn-primary/[0.06] px-4 py-4 sm:px-5 sm:py-5",
        className,
      ].join(" ")}
      aria-label={label}
    >
      <h4 className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-brand-btn-primary/90">
        {label}
      </h4>
      <p className="text-sm leading-relaxed text-brand-text-secondary whitespace-pre-line sm:text-[0.95rem] sm:leading-[1.7]">
        {body}
      </p>
    </aside>
  );
}
