"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { buttonStyles, surfaces } from "@/lib/design";
import type { ComposedJourney } from "@/lib/ai/schemas/composed-journey";
import type { DiscoveryPlace } from "@/components/discovery/discovery-data";
import { toggleWishlistPlace } from "@/actions/place-actions";
import { saveComposedJourneyEdits } from "@/actions/journey-actions";
import { normalizeComposedJourney } from "@/lib/utils/composed-journey";
import {
  addPlaceToDay,
  availableDiscoveryPlaces,
  movePlaceToDay,
  removePlaceFromDay,
  reorderPlaceInDay,
  togglePlaceLock,
} from "@/components/journey/composed-edit";
import {
  DayPlaceEditor,
  JourneyEditToolbar,
} from "@/components/journey/DayPlaceEditor";

type Props = {
  composed: ComposedJourney;
  savedPlaces: DiscoveryPlace[];
  /** All Discovery places selected for the journey (for Add place). */
  discoveryPlaces: DiscoveryPlace[];
  destination: string;
  journeyId: string;
  initialWishlistIds: string[];
  initialEditMode?: boolean;
};

function dayAnchorId(dayNumber: number) {
  return `journey-day-${dayNumber}`;
}

/**
 * Premium reading layout for a composed itinerary,
 * with an optional Edit Mode for place-level control.
 */
export function ComposedJourneySections({
  composed: composedProp,
  savedPlaces,
  discoveryPlaces,
  destination,
  journeyId,
  initialWishlistIds,
  initialEditMode = false,
}: Props) {
  const router = useRouter();
  const baseline = useMemo(
    () => normalizeComposedJourney(composedProp),
    [composedProp],
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
  const [openPlace, setOpenPlace] = useState<DiscoveryPlace | null>(null);
  const wishlistKey = initialWishlistIds.join("\0");
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(
    () => new Set(initialWishlistIds),
  );
  const [wishlistKeySnapshot, setWishlistKeySnapshot] = useState(wishlistKey);
  if (wishlistKey !== wishlistKeySnapshot) {
    setWishlistKeySnapshot(wishlistKey);
    setWishlistIds(new Set(initialWishlistIds));
  }
  const [wishlistBusyId, setWishlistBusyId] = useState<string | null>(null);
  const dayButtonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const scrollingToRef = useRef<number | null>(null);

  const availablePlaces = useMemo(
    () => availableDiscoveryPlaces(draft, discoveryPlaces),
    [draft, discoveryPlaces],
  );

  const allDayNumbers = useMemo(
    () => days.map((d) => d.dayNumber),
    [days],
  );

  const togglePlaceWishlist = useCallback(
    async (place: DiscoveryPlace) => {
      if (wishlistBusyId) return;
      setWishlistBusyId(place.id);
      const wasIn = wishlistIds.has(place.id);
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (wasIn) next.delete(place.id);
        else next.add(place.id);
        return next;
      });

      try {
        const res = await toggleWishlistPlace({
          name: place.title,
          description: place.description,
          category: place.category,
          kind: place.category,
          destination,
          journeyId,
          discoveryPlaceId: place.id,
          source: "discovery",
        });
        if (!res.success) {
          setWishlistIds((prev) => {
            const next = new Set(prev);
            if (wasIn) next.add(place.id);
            else next.delete(place.id);
            return next;
          });
        } else if (res.data.saved !== !wasIn) {
          setWishlistIds((prev) => {
            const next = new Set(prev);
            if (res.data.saved) next.add(place.id);
            else next.delete(place.id);
            return next;
          });
        }
      } catch {
        setWishlistIds((prev) => {
          const next = new Set(prev);
          if (wasIn) next.add(place.id);
          else next.delete(place.id);
          return next;
        });
      } finally {
        setWishlistBusyId(null);
      }
    },
    [destination, journeyId, wishlistBusyId, wishlistIds],
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
          const next = normalizeComposedJourney(data.composed);
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
    [dirty, draft, journeyId, router],
  );

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
      {!editMode ? (
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={() => setEditMode(true)}
            className={buttonStyles.secondary}
          >
            Edit journey
          </button>
        </div>
      ) : (
        <JourneyEditToolbar
          dirty={dirty}
          saving={saving || regeneratingDay !== null}
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
        />
      )}

      {saveError ? (
        <p className="mb-4 text-sm text-brand-btn-primary" role="alert">
          {saveError}
        </p>
      ) : null}

      {/* Sticky day navigation + reading progress */}
      <nav
        aria-label="Day navigation"
        className="sticky top-14 z-20 -mx-4 mb-10 border-b border-brand-border/50 bg-brand-bg/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:mb-12 sm:px-6 lg:top-0 lg:-mx-10 lg:px-10"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div
            role="list"
            className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
              Morning, afternoon, and evening — shaped only from the places you chose.
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
                  <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-brand-text-secondary/90">
                      Day {day.dayNumber}
                    </p>
                    {day.theme ? (
                      <h3
                        id={`day-${day.dayNumber}-title`}
                        className="font-display text-xl text-brand-text-primary sm:text-2xl"
                      >
                        {day.theme}
                      </h3>
                    ) : (
                      <h3
                        id={`day-${day.dayNumber}-title`}
                        className="font-display text-xl text-brand-text-primary sm:text-2xl"
                      >
                        Day {day.dayNumber}
                      </h3>
                    )}
                  </div>

                  <p className="max-w-2xl text-[0.95rem] leading-[1.75] text-brand-text-secondary sm:text-base">
                    {day.transition}
                  </p>

                  <p className="mt-4 text-xs leading-relaxed tracking-wide text-brand-text-secondary/85">
                    Recommended pacing — {day.pacing}
                  </p>
                </header>

                <div className="space-y-0">
                  <DaySegment label="Morning" body={day.morning} />
                  <SegmentDivider />
                  <DaySegment label="Afternoon" body={day.afternoon} />
                  <SegmentDivider />
                  <DaySegment label="Evening" body={day.evening} />
                </div>

                {day.notes ? (
                  <aside
                    className="mt-8 border-t border-brand-border/40 pt-6 sm:mt-10 sm:pt-8"
                    aria-label="Optional notes"
                  >
                    <h4 className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-brand-text-primary/80">
                      Notes
                    </h4>
                    <p className="text-sm leading-relaxed text-brand-text-secondary sm:text-[0.95rem] sm:leading-[1.7]">
                      {day.notes}
                    </p>
                  </aside>
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
                  <p className="mt-6 text-xs leading-relaxed text-brand-text-secondary/80">
                    Places this day: {day.placeTitles.join(" · ")}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        {/* Map placeholder — proper section, no map integration */}
        <section
          aria-labelledby="map-section-heading"
          className={`${surfaces.card} p-6 sm:p-8 lg:p-10`}
        >
          <header className="mb-6 sm:mb-8">
            <p className="mb-2 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-brand-text-secondary/80">
              Map
            </p>
            <h2
              id="map-section-heading"
              className="font-display text-2xl text-brand-text-primary sm:text-3xl"
            >
              Route at a glance
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-brand-text-secondary">
              A quiet placeholder for the path through {destination}.
            </p>
          </header>

          <div
            className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-brand-border/70 bg-brand-bg/60 px-6 py-14 text-center sm:min-h-[240px]"
            role="img"
            aria-label={`Map placeholder for ${destination}`}
          >
            <p className="max-w-sm text-sm leading-relaxed text-brand-text-secondary">
              A map of {destination} will live here in a later milestone — for now,
              your days hold the shape of the journey.
            </p>
          </div>
        </section>

        {/* Saved places — open original Discovery card content */}
        <section aria-labelledby="saved-places-heading">
          <header className="mb-8 sm:mb-10">
            <p className="mb-2 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-brand-text-secondary/80">
              Saved places
            </p>
            <h2
              id="saved-places-heading"
              className="font-display text-2xl text-brand-text-primary sm:text-3xl"
            >
              What you chose along the way
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-brand-text-secondary">
              Open a place to revisit its Discovery card — and keep Wishlist in sync.
            </p>
          </header>

          {savedPlaces.length === 0 ? (
            <p className="text-sm text-brand-text-secondary">
              No Discovery places were stored with this journey.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              {savedPlaces.map((place) => {
                const inWishlist = wishlistIds.has(place.id);
                return (
                  <li key={place.id} className={`${surfaces.card} flex h-full flex-col p-5`}>
                    <button
                      type="button"
                      onClick={() => setOpenPlace(place)}
                      className={[
                        "group flex flex-1 flex-col text-left",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary",
                      ].join(" ")}
                      aria-haspopup="dialog"
                    >
                      <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-brand-text-secondary/80">
                        {place.category}
                      </p>
                      <h3 className="mt-1.5 font-display text-lg text-brand-text-primary">
                        {place.title}
                      </h3>
                      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-brand-text-secondary">
                        {place.description}
                      </p>
                      <span className="mt-4 text-xs font-medium tracking-wide text-brand-text-secondary group-hover:text-brand-text-primary">
                        View Discovery card →
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={wishlistBusyId === place.id}
                      aria-pressed={inWishlist}
                      onClick={() => void togglePlaceWishlist(place)}
                      className={[
                        "mt-4 inline-flex min-h-[40px] items-center justify-center rounded-full border px-3 text-xs font-medium tracking-wide transition-colors",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        inWishlist
                          ? "border-brand-btn-primary/40 bg-brand-btn-primary/10 text-brand-btn-primary"
                          : "border-brand-border text-brand-text-secondary hover:border-brand-text-secondary hover:text-brand-text-primary",
                      ].join(" ")}
                    >
                      {inWishlist ? "In Wishlist" : "Add to Wishlist"}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
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
            <p className="max-w-2xl text-sm leading-[1.75] text-brand-text-secondary whitespace-pre-line sm:text-[0.95rem]">
              {draft.notes}
            </p>
          </section>
        ) : null}
      </div>

      <SavedPlaceDialog
        place={openPlace}
        onClose={() => setOpenPlace(null)}
        inWishlist={openPlace ? wishlistIds.has(openPlace.id) : false}
        wishlistBusy={openPlace ? wishlistBusyId === openPlace.id : false}
        onToggleWishlist={() => {
          if (openPlace) void togglePlaceWishlist(openPlace);
        }}
      />
    </div>
  );
}

function DaySegment({ label, body }: { label: string; body: string }) {
  return (
    <div className="py-1">
      <h4 className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-brand-text-primary/80">
        {label}
      </h4>
      <p className="max-w-2xl text-sm leading-[1.75] text-brand-text-secondary sm:text-[0.95rem] sm:leading-[1.8]">
        {body}
      </p>
    </div>
  );
}

function SegmentDivider() {
  return (
    <div
      className="flex items-center gap-4 py-6 sm:py-7"
      aria-hidden="true"
    >
      <span className="h-px flex-1 bg-brand-border/55" />
      <span className="select-none text-xs tracking-widest text-brand-text-secondary/45">
        ↓
      </span>
      <span className="h-px flex-1 bg-brand-border/55" />
    </div>
  );
}

function SavedPlaceDialog({
  place,
  onClose,
  inWishlist,
  wishlistBusy,
  onToggleWishlist,
}: {
  place: DiscoveryPlace | null;
  onClose: () => void;
  inWishlist: boolean;
  wishlistBusy: boolean;
  onToggleWishlist: () => void;
}) {
  if (!place) return null;

  return (
    <SavedPlaceDialogOpen
      place={place}
      onClose={onClose}
      inWishlist={inWishlist}
      wishlistBusy={wishlistBusy}
      onToggleWishlist={onToggleWishlist}
    />
  );
}

function SavedPlaceDialogOpen({
  place,
  onClose,
  inWishlist,
  wishlistBusy,
  onToggleWishlist,
}: {
  place: DiscoveryPlace;
  onClose: () => void;
  inWishlist: boolean;
  wishlistBusy: boolean;
  onToggleWishlist: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const frame = window.requestAnimationFrame(() => {
      if (!dialog.isConnected || dialog.open) return;
      try {
        dialog.showModal();
      } catch {
        // Hydration recovery or duplicate open — safe to ignore.
      }
    });

    return () => {
      window.cancelAnimationFrame(frame);
      if (dialog.isConnected && dialog.open) {
        try {
          dialog.close();
        } catch {
          // Node may already be detached.
        }
      }
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descId}
      className={[
        "m-auto w-[calc(100%-2rem)] max-w-lg rounded-3xl border border-brand-card-border",
        "bg-brand-card p-0 text-brand-text-primary shadow-stage",
        "backdrop:bg-brand-text-primary/30",
        "open:flex open:flex-col",
      ].join(" ")}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="flex flex-col p-6 sm:p-8">
        <span className={`${surfaces.chip} mb-3 inline-flex w-fit`}>
          {place.category}
        </span>

        <h2 id={titleId} className="font-display text-2xl font-light tracking-tight">
          {place.title}
        </h2>

        <p
          id={descId}
          className="mt-3 text-sm leading-relaxed text-brand-text-secondary"
        >
          {place.description}
        </p>

        {place.highlights.length > 0 ? (
          <ul className="mt-5 space-y-1.5 border-t border-brand-border/40 pt-5">
            {place.highlights.map((highlight) => (
              <li
                key={highlight}
                className="text-xs leading-snug text-brand-text-secondary"
              >
                {highlight}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            disabled={wishlistBusy}
            aria-pressed={inWishlist}
            onClick={onToggleWishlist}
            className={[
              "inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full border px-5 text-sm font-medium transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary",
              "disabled:cursor-not-allowed disabled:opacity-50",
              inWishlist
                ? "border-brand-btn-primary/40 bg-brand-btn-primary/10 text-brand-btn-primary"
                : "border-brand-border text-brand-text-primary hover:border-brand-text-secondary",
            ].join(" ")}
          >
            {inWishlist ? "In Wishlist" : "Add to Wishlist"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full border border-brand-border px-5 text-sm font-medium text-brand-text-primary transition-colors hover:border-brand-text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary"
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}
