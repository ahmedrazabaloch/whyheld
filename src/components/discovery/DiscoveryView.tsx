"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { buttonStyles } from "@/lib/design";
import { EmptyState } from "@/components/dashboard";
import { saveDiscoveryState } from "@/actions/journey-actions";
import type {
  DestinationIntroduction,
  DiscoveryDraftState,
  DiscoveryPlace,
} from "./discovery-data";
import { DiscoveryPlaceCard, DiscoveryPlaceSkeleton } from "./DiscoveryPlaceCard";

type DiscoveryViewProps = {
  journeyId: string;
  destination: string;
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
};

/**
 * Share one in-flight initial Discover request per journey.
 * React Strict Mode remounts would otherwise fire two Anthropic calls;
 * the first often aborted/failed with 502 while the second succeeded.
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

  const hasCachedPlaces = (initialDiscovery?.places?.length ?? 0) > 0;
  const [isLoading, setIsLoading] = useState(!hasCachedPlaces);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [failed, setFailed] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const placesRef = useRef(places);
  const journeyIdsRef = useRef(journeyIds);
  const wishlistIdsRef = useRef(wishlistIds);
  /** Skip the hydration commit so we do not echo server state back immediately. */
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

  /**
   * Persist after state has committed — never from setState updaters / render.
   * Debounce so rapid Add to Journey / Wishlist clicks coalesce.
   */
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
      });
    }, 200);

    return () => {
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    };
  }, [places, journeyIds, wishlistIds, journeyId]);

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

  /** Local state only — persistence runs in the committed effect above. */
  const toggleJourney = useCallback((id: string) => {
    setJourneyIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
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
      // Flush any pending debounced persist, then write a final authoritative snapshot.
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
        persistTimerRef.current = null;
      }
      await saveDiscoveryState(journeyId, {
        places: placesRef.current,
        journeyPlaceIds: Array.from(journeyIdsRef.current),
        wishlistPlaceIds: Array.from(wishlistIdsRef.current),
      });
      if (mode === "edit") {
        router.push(returnHref || `/journeys/${journeyId}?edit=1`);
      } else {
        router.push(`/journeys/${journeyId}/compose`);
      }
    } catch {
      setIsFinishing(false);
    }
  };

  const placeCount = places.length;
  const selectedCount = journeyIds.size;

  const summaryLines =
    isLoading
      ? [
          "Places are being gathered.",
          "This will only take a moment.",
          "Choose what feels right when they arrive.",
        ]
      : selectedCount === 0
        ? [
            `${placeCount || 10} places waiting to be explored`,
            "Nothing has been chosen yet.",
            "Choose the places that feel right.",
          ]
        : [
            `${placeCount} places waiting to be explored`,
            selectedCount === 1
              ? "You've chosen 1 place so far."
              : `You've chosen ${selectedCount} places so far.`,
            "Nothing is final. You can always change your mind.",
          ];

  return (
    <div className="mx-auto w-full max-w-3xl">
      <header className="mb-10 sm:mb-12">
        <p className="mb-3 inline-flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.2em] text-brand-btn-primary">
          <span className="h-px w-5 bg-brand-btn-primary/60" aria-hidden />
          Discovery
        </p>
        <h1 className="font-display text-4xl font-light tracking-tight text-brand-text-primary sm:text-5xl">
          {destination}
        </h1>
      </header>

      <section className="max-w-2xl space-y-5 border-l border-brand-btn-primary/30 pl-5 sm:pl-6">
        <p className="text-base font-light leading-relaxed text-brand-text-primary sm:text-lg">
          {introduction.culturalIdentity}
        </p>
        <p className="text-base font-light leading-relaxed text-brand-text-secondary sm:text-lg">
          {introduction.heritage}
        </p>
        <p className="text-base font-light leading-relaxed text-brand-text-secondary sm:text-lg">
          {introduction.atmosphere}
        </p>
        <p className="text-base font-light leading-relaxed text-brand-text-secondary sm:text-lg">
          {introduction.whatMakesItSpecial}
        </p>
      </section>

      <section className="mt-12 max-w-xl space-y-2 border-t border-brand-border/50 pt-10 sm:mt-14 sm:pt-12">
        {summaryLines.map((line, index) => (
          <p
            key={line}
            className={
              index === 0
                ? "font-display text-lg font-light text-brand-text-primary sm:text-xl"
                : "text-sm leading-relaxed text-brand-text-secondary"
            }
          >
            {line}
          </p>
        ))}
      </section>

      <div className="my-12 flex items-center gap-4 sm:my-14">
        <span className="h-px flex-1 bg-brand-border/60" aria-hidden />
        <p className="shrink-0 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-brand-text-secondary">
          Places worth discovering
        </p>
        <span className="h-px flex-1 bg-brand-border/60" aria-hidden />
      </div>

      {!isLoading && places.length > 0 && (
        <div className="mb-8 flex items-baseline gap-6 text-sm text-brand-text-secondary sm:mb-10">
          <p>
            <span className="text-brand-text-primary">{placeCount}</span>{" "}
            {placeCount === 1 ? "Place" : "Places"}
          </p>
          <p>
            <span className="text-brand-text-primary">{selectedCount}</span>{" "}
            Selected
          </p>
        </div>
      )}

      {isLoading ? (
        <div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:items-stretch"
          aria-busy="true"
          aria-label="Gathering places"
        >
          {Array.from({ length: 6 }).map((_, i) => (
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:items-stretch">
          {places.map((place) => (
            <DiscoveryPlaceCard
              key={place.id}
              place={place}
              inJourney={journeyIds.has(place.id)}
              inWishlist={wishlistIds.has(place.id)}
              onToggleJourney={() => toggleJourney(place.id)}
              onToggleWishlist={() => toggleWishlist(place.id)}
            />
          ))}
        </div>
      )}

      {!isLoading && places.length > 0 && (
        <footer className="mt-16 flex flex-col items-center gap-8 border-t border-brand-border/40 pt-14 sm:mt-20 sm:pt-16">
          <div className="flex flex-col items-center gap-4 text-center">
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
              {isLoadingMore ? "Gathering more…" : "Discover 5 More Places"}
            </button>
          </div>

          <button
            type="button"
            className={buttonStyles.primary}
            onClick={() => {
              void handleDoneExploring();
            }}
            disabled={isFinishing}
          >
            {isFinishing
              ? "Saving…"
              : mode === "edit"
                ? "Return to Journey"
                : "Done Exploring"}
          </button>
        </footer>
      )}
    </div>
  );
}
