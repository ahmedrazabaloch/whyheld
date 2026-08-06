"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { buttonStyles } from "@/lib/design";
import { EmptyState } from "@/components/dashboard";
import { GenerationHero } from "@/components/journey/generation/GenerationHero";
import { saveDiscoveryState } from "@/actions/journey-actions";
import type {
  DestinationIntroduction,
  DiscoveryBoardStatus,
  DiscoveryDraftState,
  DiscoveryPlace,
} from "./discovery-data";
import { paceLabel } from "./discovery-data";
import { feelingLabels } from "@/lib/journey/feelings";
import { DiscoveryPlaceCard, DiscoveryPlaceSkeleton } from "./DiscoveryPlaceCard";
import { DiscoveryJourneyBoard } from "./DiscoveryJourneyBoard";

type DiscoveryViewProps = {
  journeyId: string;
  destination: string;
  journeyTitle: string;
  pace: string | null;
  /** Journey Feel chips chosen in the builder — these steer generation. */
  feelings?: string[];
  introduction: DestinationIntroduction;
  /** Server-hydrated discovery state (source of truth). */
  initialDiscovery: DiscoveryDraftState | null;
  /** setup = first compose path; edit = reopen from a ready journey. */
  mode?: "setup" | "edit";
  returnHref?: string;
};

type ApiPlace = {
  category: string;
  title: string;
  description: string;
  highlights: string[];
  localTips?: string;
  guideNote?: string;
  weatherNote?: string;
};

/**
 * Share one in-flight initial Discover request per journey.
 * React Strict Mode remounts would otherwise fire two Anthropic calls.
 */
const initialDiscoverInflight = new Map<string, Promise<ApiPlace[]>>();

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase();
}

function toDiscoveryPlaces(raw: ApiPlace[], usedTitles: Set<string>): DiscoveryPlace[] {
  const places: DiscoveryPlace[] = [];
  for (const item of raw) {
    const key = normalizeTitle(item.title);
    if (!key || usedTitles.has(key)) continue;
    usedTitles.add(key);
    places.push({
      id: crypto.randomUUID(),
      category: item.category,
      title: item.title,
      description: item.description,
      highlights: item.highlights,
      localTips: item.localTips,
      guideNote: item.guideNote,
      weatherNote: item.weatherNote,
    });
  }
  return places;
}

function isAbortError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  return "name" in error && (error as { name?: string }).name === "AbortError";
}

async function requestPlaces(
  journeyId: string,
  count: 5 | 10,
  excludeTitles: string[],
  selectedTitles: string[],
  wishlistTitles: string[],
  signal?: AbortSignal,
): Promise<ApiPlace[]> {
  const res = await fetch(`/api/v1/journeys/${journeyId}/discover`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      count,
      excludeTitles,
      selectedTitles,
      wishlistTitles,
    }),
    signal,
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || "Unable to gather places.");
  }

  const data = (await res.json()) as { places: ApiPlace[] };
  return data.places ?? [];
}

function requestInitialPlaces(journeyId: string): Promise<ApiPlace[]> {
  const existing = initialDiscoverInflight.get(journeyId);
  if (existing) return existing;

  const promise = requestPlaces(journeyId, 10, [], [], []).finally(() => {
    initialDiscoverInflight.delete(journeyId);
  });
  initialDiscoverInflight.set(journeyId, promise);
  return promise;
}

export function DiscoveryView({
  journeyId,
  destination,
  journeyTitle,
  pace,
  feelings = [],
  introduction,
  initialDiscovery,
  mode = "setup",
  returnHref,
}: DiscoveryViewProps) {
  const router = useRouter();

  const [places, setPlaces] = useState<DiscoveryPlace[]>(
    () => initialDiscovery?.places ?? [],
  );
  const [journeyIds, setJourneyIds] = useState<Set<string>>(
    () => new Set(initialDiscovery?.journeyPlaceIds ?? []),
  );
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(
    () => new Set(initialDiscovery?.wishlistPlaceIds ?? []),
  );
  const [boardStatus, setBoardStatus] = useState<DiscoveryBoardStatus>(
    () => initialDiscovery?.boardStatus ?? "PENDING",
  );
  const [cardTitle, setCardTitle] = useState(journeyTitle);

  const hasCachedPlaces = (initialDiscovery?.places?.length ?? 0) > 0;
  const [isLoading, setIsLoading] = useState(!hasCachedPlaces);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [failed, setFailed] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const placesRef = useRef(places);
  const journeyIdsRef = useRef(journeyIds);
  const wishlistIdsRef = useRef(wishlistIds);
  const boardStatusRef = useRef(boardStatus);
  const persistEnabledRef = useRef(false);
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    placesRef.current = places;
  }, [places]);
  useEffect(() => {
    journeyIdsRef.current = journeyIds;
  }, [journeyIds]);
  useEffect(() => {
    wishlistIdsRef.current = wishlistIds;
  }, [wishlistIds]);
  useEffect(() => {
    boardStatusRef.current = boardStatus;
  }, [boardStatus]);

  useEffect(() => {
    if (!persistEnabledRef.current) {
      persistEnabledRef.current = true;
      return;
    }

    if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    persistTimerRef.current = setTimeout(() => {
      persistTimerRef.current = null;
      void saveDiscoveryState(journeyId, {
        places: placesRef.current,
        journeyPlaceIds: Array.from(journeyIdsRef.current),
        wishlistPlaceIds: Array.from(wishlistIdsRef.current),
        boardStatus: boardStatusRef.current,
      });
    }, 200);

    return () => {
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    };
  }, [places, journeyIds, wishlistIds, boardStatus, journeyId]);

  const applyInitialPlaces = useCallback(
    async (raw: ApiPlace[]) => {
      const used = new Set<string>();
      const nextPlaces = toDiscoveryPlaces(raw, used);
      setPlaces(nextPlaces);
      setJourneyIds(new Set());
      setWishlistIds(new Set());
      await saveDiscoveryState(journeyId, {
        places: nextPlaces,
        journeyPlaceIds: [],
        wishlistPlaceIds: [],
        boardStatus: boardStatusRef.current,
      });
    },
    [journeyId],
  );

  const loadInitial = useCallback(async () => {
    setIsLoading(true);
    setFailed(false);
    try {
      const raw = await requestInitialPlaces(journeyId);
      await applyInitialPlaces(raw);
      setFailed(false);
    } catch (error) {
      if (isAbortError(error)) return;
      setFailed(true);
      setPlaces([]);
    } finally {
      setIsLoading(false);
    }
  }, [journeyId, applyInitialPlaces]);

  useEffect(() => {
    if (hasCachedPlaces) return;

    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      setFailed(false);
      try {
        const raw = await requestInitialPlaces(journeyId);
        if (cancelled) return;
        await applyInitialPlaces(raw);
        if (cancelled) return;
        setFailed(false);
      } catch (error) {
        if (cancelled || isAbortError(error)) return;
        setFailed(true);
        setPlaces([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [journeyId, hasCachedPlaces, applyInitialPlaces]);

  const handleDiscoverMore = async () => {
    if (isLoadingMore || isLoading) return;
    setIsLoadingMore(true);
    try {
      const currentPlaces = placesRef.current;
      const excludeTitles = currentPlaces.map((p) => p.title);
      const selectedTitles = currentPlaces
        .filter((p) => journeyIdsRef.current.has(p.id))
        .map((p) => p.title);
      const wishlistTitles = currentPlaces
        .filter((p) => wishlistIdsRef.current.has(p.id))
        .map((p) => p.title);

      const raw = await requestPlaces(
        journeyId,
        5,
        excludeTitles,
        selectedTitles,
        wishlistTitles,
      );
      const used = new Set(currentPlaces.map((p) => normalizeTitle(p.title)));
      const next = toDiscoveryPlaces(raw, used);
      setPlaces([...currentPlaces, ...next]);
      setFailed(false);
    } catch (error) {
      if (isAbortError(error)) return;
      if (placesRef.current.length === 0) setFailed(true);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const addToCurrentJourney = useCallback(
    (place: DiscoveryPlace) => {
      setJourneyIds((prev) => {
        if (prev.has(place.id)) return prev;
        const next = new Set(prev);
        next.add(place.id);
        journeyIdsRef.current = next;
        return next;
      });
      toast.success(`Added “${place.title}” to ${cardTitle}`);
    },
    [cardTitle],
  );

  const removeFromJourney = useCallback((id: string) => {
    setJourneyIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      journeyIdsRef.current = next;
      return next;
    });
  }, []);

  const toggleWishlist = useCallback((id: string) => {
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      wishlistIdsRef.current = next;
      return next;
    });
  }, []);

  const handleDoneExploring = async () => {
    if (isFinishing) return;
    setIsFinishing(true);
    try {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
        persistTimerRef.current = null;
      }
      await saveDiscoveryState(journeyId, {
        places: placesRef.current,
        journeyPlaceIds: Array.from(journeyIdsRef.current),
        wishlistPlaceIds: Array.from(wishlistIdsRef.current),
        boardStatus: boardStatusRef.current,
      });
      if (mode === "edit") {
        router.push(returnHref || `/journeys/${journeyId}`);
      } else {
        router.push(`/journeys/${journeyId}/compose`);
      }
    } catch {
      setIsFinishing(false);
    }
  };

  const selectedPlaces = places.filter((p) => journeyIds.has(p.id));
  const selectedCount = journeyIds.size;
  const summaryText = [
    introduction.culturalIdentity,
    introduction.whatMakesItSpecial,
  ].join(" ");

  return (
    <div className="w-full pb-16">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Left rail — destination hero + journey board */}
        <aside className="flex w-full shrink-0 flex-col gap-6 lg:w-[340px]">
          <GenerationHero
            destination={destination}
            state={isLoading ? "PREPARING" : "PERSISTING"}
          />

          <div className="lg:sticky lg:top-20 lg:z-10">
            <DiscoveryJourneyBoard
              journeyId={journeyId}
              title={cardTitle}
              destination={destination}
              places={selectedPlaces}
              boardStatus={boardStatus}
              onTitleChange={setCardTitle}
              onBoardStatusChange={setBoardStatus}
              onRemovePlace={removeFromJourney}
              doneExploring={
                !isLoading && places.length > 0
                  ? {
                      label:
                        mode === "edit" ? "Return to Journey" : "Done Exploring",
                      busyLabel: "Saving…",
                      disabled: selectedCount === 0,
                      busy: isFinishing,
                      onClick: () => {
                        void handleDoneExploring();
                      },
                    }
                  : undefined
              }
            />
          </div>
        </aside>

        {/* Main column — summary + places */}
        <div className="min-w-0 flex-1">
          <header className="mb-8">
            <p className="mb-3 inline-flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.2em] text-brand-btn-primary">
              <span className="h-px w-5 bg-brand-btn-primary/60" aria-hidden />
              Discovery
            </p>
            <h1 className="font-display text-3xl font-light tracking-tight text-brand-text-primary sm:text-4xl">
              {destination}
            </h1>
            <p className="mt-4 max-w-2xl text-base font-light leading-relaxed text-brand-text-secondary sm:text-lg">
              {summaryText}
            </p>

            <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-brand-border/50 pt-5 sm:grid-cols-2">
              <div>
                <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-brand-text-secondary">
                  Journey feel
                </dt>
                <dd className="mt-1.5">
                  {feelings.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {feelingLabels(feelings).map((label) => (
                        <span
                          key={label}
                          className="rounded-full border border-brand-btn-primary/40 bg-brand-btn-primary/10 px-2.5 py-1 text-xs font-medium text-brand-text-primary"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-brand-text-primary">
                      {paceLabel(pace)}
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-brand-text-secondary">
                  Destination
                </dt>
                <dd className="mt-1.5 text-sm text-brand-text-primary">{destination}</dd>
              </div>
            </dl>
          </header>

          <div className="mb-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-brand-border/60" aria-hidden />
            <p className="shrink-0 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-brand-text-secondary">
              Places worth discovering
            </p>
            <span className="h-px flex-1 bg-brand-border/60" aria-hidden />
          </div>

          {isLoading ? (
            <div
              className="grid grid-cols-1 gap-5"
              aria-busy="true"
              aria-label="Gathering places"
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <DiscoveryPlaceSkeleton key={i} />
              ))}
            </div>
          ) : places.length === 0 || failed ? (
            <EmptyState
              icon={
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              }
              title="We're gathering places that deserve your time."
              description="This collection is still taking shape. Return shortly and the path will be clearer."
              action={
                <button
                  type="button"
                  className={buttonStyles.secondary}
                  onClick={() => {
                    void loadInitial();
                  }}
                >
                  Try again
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {places.map((place) => (
                <DiscoveryPlaceCard
                  key={place.id}
                  place={place}
                  inJourney={journeyIds.has(place.id)}
                  inWishlist={wishlistIds.has(place.id)}
                  onAddToJourney={() => {
                    addToCurrentJourney(place);
                  }}
                  onRemoveFromJourney={() => removeFromJourney(place.id)}
                  onToggleWishlist={() => toggleWishlist(place.id)}
                />
              ))}
            </div>
          )}

          {!isLoading && places.length > 0 && (
            <footer className="mt-14 flex flex-col items-center gap-4 border-t border-brand-border/40 pt-12 text-center">
              <p className="text-sm text-brand-text-secondary">
                There&apos;s more to discover.
              </p>
              <button
                type="button"
                className={buttonStyles.secondary}
                onClick={() => {
                  void handleDiscoverMore();
                }}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? "Gathering more…" : "Discover More Places"}
              </button>
            </footer>
          )}
        </div>
      </div>
    </div>
  );
}
