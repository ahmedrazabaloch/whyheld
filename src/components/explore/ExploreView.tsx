"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { buttonStyles, formStyles } from "@/lib/design";
import { EmptyState } from "@/components/dashboard";
import {
  DiscoveryPlaceCard,
  DiscoveryPlaceSkeleton,
} from "@/components/discovery/DiscoveryPlaceCard";
import type { DiscoveryPlace } from "@/components/discovery/discovery-data";
import { createJourneyBoardWithPlace } from "@/actions/journey-actions";
import { toggleWishlistPlace } from "@/actions/place-actions";
import { LocationAutocomplete } from "@/components/location/LocationAutocomplete";
import { ExploreIntentionModal } from "@/components/explore/ExploreIntentionModal";
import { exploreFilterLabels } from "@/lib/explore/filters";
import {
  TRENDING_DESTINATIONS,
  pushRecentSearch,
  readRecentSearches,
} from "@/lib/explore/recents";

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
 * The journey card that Explore adds land on. Scoped to the destination that
 * was searched: without this, a target remembered for one place kept absorbing
 * results from every later search into the same unrelated journey.
 */
type PreferredAddTarget = { id: string; title: string; destination: string };

const EXPLORE_ADD_TARGET_KEY = "wayheld:explore-add-target";

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase();
}

function sameDestination(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

function toDiscoveryPlaces(
  raw: ApiPlace[],
  usedTitles: Set<string>,
): DiscoveryPlace[] {
  const out: DiscoveryPlace[] = [];
  for (const item of raw) {
    const key = normalizeTitle(item.title);
    if (!key || usedTitles.has(key)) continue;
    usedTitles.add(key);
    out.push({
      id: crypto.randomUUID(),
      category: item.category,
      title: item.title,
      description: item.description,
      highlights: item.highlights ?? [],
      localTips: item.localTips,
      guideNote: item.guideNote,
      weatherNote: item.weatherNote,
    });
  }
  return out;
}

function readPreferredAddTarget(
  destination?: string,
): PreferredAddTarget | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(EXPLORE_ADD_TARGET_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PreferredAddTarget;
    if (!parsed?.id?.trim()) return null;
    const stored = {
      id: parsed.id.trim(),
      title: parsed.title?.trim() || "your journey",
      destination: parsed.destination?.trim() || "",
    };
    // A target only counts for the destination it was created under.
    if (destination && !sameDestination(stored.destination, destination)) {
      return null;
    }
    return stored;
  } catch {
    return null;
  }
}

function writePreferredAddTarget(target: PreferredAddTarget) {
  try {
    sessionStorage.setItem(EXPLORE_ADD_TARGET_KEY, JSON.stringify(target));
  } catch {
    // ignore
  }
}

function clearPreferredAddTarget() {
  try {
    sessionStorage.removeItem(EXPLORE_ADD_TARGET_KEY);
  } catch {
    // ignore
  }
}

type AddPlaceOutcome =
  | { ok: true }
  | { ok: false; status: number; message: string };

/**
 * Adds a place through the route handler rather than the server action, so
 * rapid taps are not queued behind one another and navigation stays responsive.
 */
async function addPlaceViaApi(
  targetJourneyId: string,
  place: DiscoveryPlace,
): Promise<AddPlaceOutcome> {
  const res = await fetch("/api/v1/journeys/add-place", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      targetJourneyId,
      place: {
        id: place.id,
        category: place.category,
        title: place.title,
        description: place.description,
        highlights: place.highlights,
        localTips: place.localTips,
        guideNote: place.guideNote,
        weatherNote: place.weatherNote,
      },
    }),
  });

  if (res.ok) return { ok: true };

  const data = (await res.json().catch(() => ({}))) as {
    error?: { message?: string };
  };
  return {
    ok: false,
    status: res.status,
    message: data.error?.message || "Could not add this place.",
  };
}

async function requestPlaces(input: {
  destination: string;
  count: 5 | 10;
  excludeTitles: string[];
  selectedTitles: string[];
  wishlistTitles: string[];
  filters: string[];
  signal?: AbortSignal;
}): Promise<ApiPlace[]> {
  const res = await fetch("/api/v1/explore", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      destination: input.destination,
      count: input.count,
      excludeTitles: input.excludeTitles,
      selectedTitles: input.selectedTitles,
      wishlistTitles: input.wishlistTitles,
      filters: input.filters,
    }),
    signal: input.signal,
  });

  const data = (await res.json().catch(() => ({}))) as {
    places?: ApiPlace[];
    error?: string;
  };

  if (!res.ok) {
    throw new Error(data.error || "Could not gather places.");
  }
  return data.places ?? [];
}

export function ExploreView() {
  const [query, setQuery] = useState("");
  const [activeDestination, setActiveDestination] = useState("");
  // Filters behind the results currently on screen; also seed the intention step.
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [intentionOpen, setIntentionOpen] = useState(false);
  const [places, setPlaces] = useState<DiscoveryPlace[]>([]);
  const [journeyIds, setJourneyIds] = useState<Set<string>>(new Set());
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [failed, setFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [preferredAddTarget, setPreferredAddTarget] =
    useState<PreferredAddTarget | null>(null);
  // A set, not a single id — several places can be saving at once.
  const [addBusyIds, setAddBusyIds] = useState<Set<string>>(new Set());
  const [wishlistBusyId, setWishlistBusyId] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    setRecentSearches(readRecentSearches());
  }, []);

  const rememberAddTarget = useCallback((target: PreferredAddTarget) => {
    writePreferredAddTarget(target);
    setPreferredAddTarget(target);
  }, []);

  const markAdded = useCallback((placeId: string) => {
    setJourneyIds((prev) => {
      const next = new Set(prev);
      next.add(placeId);
      return next;
    });
  }, []);

  const unmarkAdded = useCallback((placeId: string) => {
    setJourneyIds((prev) => {
      const next = new Set(prev);
      next.delete(placeId);
      return next;
    });
  }, []);

  const setAddBusy = useCallback((placeId: string, busy: boolean) => {
    setAddBusyIds((prev) => {
      const next = new Set(prev);
      if (busy) next.add(placeId);
      else next.delete(placeId);
      return next;
    });
  }, []);

  const runSearch = useCallback(
    async (rawDestination: string, filters: string[]) => {
      const destination = rawDestination.trim();
      if (destination.length < 2 || isLoading) return;

      setQuery(destination);
      setIntentionOpen(false);
      setIsLoading(true);
      setFailed(false);
      setErrorMessage(null);
      setPlaces([]);
      setJourneyIds(new Set());
      setWishlistIds(new Set());
      setActiveDestination(destination);
      setActiveFilters(filters);
      // Reuse the card built for this destination; ignore other destinations'.
      setPreferredAddTarget(readPreferredAddTarget(destination));

      try {
        const raw = await requestPlaces({
          destination,
          count: 10,
          excludeTitles: [],
          selectedTitles: [],
          wishlistTitles: [],
          filters,
        });
        const next = toDiscoveryPlaces(raw, new Set());
        if (next.length === 0) {
          setFailed(true);
          setErrorMessage("No places found for that search. Try another place.");
          return;
        }
        setPlaces(next);
        setRecentSearches(pushRecentSearch(destination));
      } catch (err) {
        setFailed(true);
        setErrorMessage(
          err instanceof Error ? err.message : "Could not gather places.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading],
  );

  // Explore does not search straight away — it opens the intention step first.
  const handleSearch = (event?: FormEvent) => {
    event?.preventDefault();
    if (query.trim().length < 2 || isLoading) return;
    setIntentionOpen(true);
  };

  const handleExploreMore = async () => {
    if (!activeDestination || isLoadingMore || isLoading) return;
    setIsLoadingMore(true);
    setErrorMessage(null);
    try {
      const raw = await requestPlaces({
        destination: activeDestination,
        count: 5,
        excludeTitles: places.map((p) => p.title),
        selectedTitles: places
          .filter((p) => journeyIds.has(p.id))
          .map((p) => p.title),
        wishlistTitles: places
          .filter((p) => wishlistIds.has(p.id))
          .map((p) => p.title),
        filters: activeFilters,
      });
      const used = new Set(places.map((p) => normalizeTitle(p.title)));
      const next = toDiscoveryPlaces(raw, used);
      if (next.length === 0) {
        toast.message("Nothing new turned up — try a broader place name.");
        return;
      }
      setPlaces((prev) => [...prev, ...next]);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not gather more places.",
      );
    } finally {
      setIsLoadingMore(false);
    }
  };

  /**
   * Adds a place to the journey card for the destination being explored,
   * creating that card on the first add. Places from one search can no longer
   * land on a card belonging to a different destination.
   */
  const addPlaceToDestinationCard = useCallback(
    async (place: DiscoveryPlace) => {
      const destination = activeDestination.trim();
      if (!destination) return;

      const preferred =
        preferredAddTarget || readPreferredAddTarget(destination);

      // Show it as added straight away; each request runs on its own so a slow
      // one never holds up the next tap.
      markAdded(place.id);
      setAddBusy(place.id, true);
      try {
        if (!preferred) {
          const created = await createJourneyBoardWithPlace({
            destination,
            place: {
              id: place.id,
              category: place.category,
              title: place.title,
              description: place.description,
              highlights: place.highlights,
              localTips: place.localTips,
              guideNote: place.guideNote,
              weatherNote: place.weatherNote,
            },
          });
          if (!created.success) {
            unmarkAdded(place.id);
            toast.error(created.error || "Could not start a journey card.");
            return;
          }
          rememberAddTarget({
            id: created.data.journeyId,
            title: created.data.title,
            destination,
          });
          toast.success(`Started “${created.data.title}” with this place`);
          return;
        }

        const res = await addPlaceViaApi(preferred.id, place);
        if (!res.ok) {
          unmarkAdded(place.id);
          if (res.status === 404) {
            clearPreferredAddTarget();
            setPreferredAddTarget(null);
          }
          toast.error(res.message);
          return;
        }
        rememberAddTarget(preferred);
        toast.success(`Added “${place.title}” to ${preferred.title}`);
      } catch {
        unmarkAdded(place.id);
        toast.error("Could not add this place.");
      } finally {
        setAddBusy(place.id, false);
      }
    },
    [
      activeDestination,
      preferredAddTarget,
      rememberAddTarget,
      markAdded,
      unmarkAdded,
      setAddBusy,
    ],
  );

  const handleToggleWishlist = useCallback(
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
          destination: activeDestination || query,
          discoveryPlaceId: place.id,
          source: "journey",
        });
        if (!res.success) {
          setWishlistIds((prev) => {
            const next = new Set(prev);
            if (wasIn) next.add(place.id);
            else next.delete(place.id);
            return next;
          });
          toast.error(res.error || "Could not update wishlist.");
          return;
        }
        toast.success(
          wasIn
            ? `Removed “${place.title}” from wishlist`
            : `Saved “${place.title}” for later`,
        );
      } catch {
        setWishlistIds((prev) => {
          const next = new Set(prev);
          if (wasIn) next.add(place.id);
          else next.delete(place.id);
          return next;
        });
        toast.error("Could not update wishlist.");
      } finally {
        setWishlistBusyId(null);
      }
    },
    [wishlistBusyId, wishlistIds, activeDestination, query],
  );

  const chipClass = () =>
    [
      "rounded-full border px-3.5 py-2 text-xs font-medium tracking-wide transition-colors",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary",
      "border-brand-border/80 bg-brand-card text-brand-text-secondary hover:border-brand-text-secondary hover:text-brand-text-primary",
    ].join(" ");

  return (
    <div className="w-full pb-16">
      <form
        onSubmit={handleSearch}
        className="mb-10 rounded-2xl border border-brand-btn-primary/25 bg-brand-btn-primary/[0.08] p-6 shadow-sm sm:p-8"
      >
        <h2 className="font-display text-2xl font-light tracking-tight text-brand-text-primary sm:text-3xl">
          Where would you like to wander?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-brand-text-secondary">
          Enter a town, region, or route. You&apos;ll choose what you&apos;re
          seeking next.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <LocationAutocomplete
            label=""
            placeholder="Search a city, country, or route"
            value={query}
            onChange={(_placeId, desc) => setQuery(desc)}
            onInputChange={setQuery}
            disabled={isLoading}
            className="min-w-0 flex-1 gap-0"
            inputClassName="h-12 py-0"
          />
          <button
            type="submit"
            className={`${buttonStyles.primary} w-full shrink-0 sm:w-auto sm:min-w-[8.5rem]`}
            disabled={isLoading || query.trim().length < 2}
          >
            {isLoading ? "Exploring…" : "Explore"}
          </button>
        </div>
        <p className={`${formStyles.hint} mt-2.5`}>
          Choosing a place opens a short step where you can focus the kinds of
          places we gather — or continue open.
        </p>

        <div className="mt-7 grid grid-cols-1 gap-6 border-t border-brand-border/50 pt-6 md:grid-cols-2 md:gap-8">
          <div>
            <p className={formStyles.label}>Trending destinations</p>
            <div
              role="group"
              aria-label="Trending destinations"
              className="mt-2.5 flex flex-wrap gap-2"
            >
              {TRENDING_DESTINATIONS.map((place) => (
                <button
                  key={place}
                  type="button"
                  className={chipClass()}
                  disabled={isLoading}
                  onClick={() => setQuery(place)}
                >
                  {place}
                </button>
              ))}
            </div>
          </div>

          <div className="md:border-l md:border-brand-border/50 md:pl-8">
            <p className={formStyles.label}>Recent searches</p>
            {recentSearches.length > 0 ? (
              <div
                role="group"
                aria-label="Recent searches"
                className="mt-2.5 flex flex-wrap gap-2"
              >
                {recentSearches.map((place) => (
                  <button
                    key={place}
                    type="button"
                    className={chipClass()}
                    disabled={isLoading}
                    onClick={() => setQuery(place)}
                  >
                    {place}
                  </button>
                ))}
              </div>
            ) : (
              <p className={`${formStyles.hint} mt-2.5`}>
                Your recent places will appear here after you explore.
              </p>
            )}
          </div>
        </div>

      </form>

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
      ) : failed && places.length === 0 ? (
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
              <circle cx="12" cy="12" r="9" />
              <path d="M12 3v18" />
              <path d="M3 12h18" />
            </svg>
          }
          title="Nothing gathered yet"
          description={
            errorMessage ||
            "Try another country, city, or place — something quieter may appear."
          }
          action={
            <button
              type="button"
              className={buttonStyles.secondary}
              onClick={() => {
                void runSearch(query, activeFilters);
              }}
            >
              Try again
            </button>
          }
        />
      ) : places.length > 0 ? (
        <>
          <div className="mb-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-brand-border/60" aria-hidden />
            <p className="shrink-0 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-brand-text-secondary">
              Places in {activeDestination}
            </p>
            <span className="h-px flex-1 bg-brand-border/60" aria-hidden />
          </div>

          <div className="mb-8 space-y-2 rounded-2xl border border-brand-border/50 bg-brand-card/50 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs leading-relaxed text-brand-text-secondary">
                {activeFilters.length > 0
                  ? `Looking toward ${exploreFilterLabels(activeFilters).join(" · ")}.`
                  : "Gathered openly — nothing narrowed."}
              </p>
              <button
                type="button"
                className="shrink-0 text-xs font-medium text-brand-btn-primary underline-offset-4 transition-colors hover:text-brand-btn-primary-hover hover:underline"
                onClick={() => setIntentionOpen(true)}
              >
                Adjust intention
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-brand-border/40 pt-2">
              <p className="text-xs leading-relaxed text-brand-text-secondary">
                {preferredAddTarget ? (
                  <>
                    Saving to{" "}
                    <span className="text-brand-text-primary">
                      {preferredAddTarget.title}
                    </span>
                    .
                  </>
                ) : (
                  `Places you add will start a new journey card for ${activeDestination}.`
                )}
              </p>
              {preferredAddTarget ? (
                <button
                  type="button"
                  className="shrink-0 text-xs font-medium text-brand-btn-primary underline-offset-4 transition-colors hover:text-brand-btn-primary-hover hover:underline"
                  onClick={() => {
                    clearPreferredAddTarget();
                    setPreferredAddTarget(null);
                  }}
                >
                  Use a different card
                </button>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {places.map((place) => (
              <DiscoveryPlaceCard
                key={place.id}
                place={place}
                inJourney={journeyIds.has(place.id)}
                inWishlist={wishlistIds.has(place.id)}
                addBusy={addBusyIds.has(place.id)}
                onAddToJourney={() => {
                  void addPlaceToDestinationCard(place);
                }}
                onRemoveFromJourney={() => {
                  setJourneyIds((prev) => {
                    const next = new Set(prev);
                    next.delete(place.id);
                    return next;
                  });
                }}
                onToggleWishlist={() => {
                  void handleToggleWishlist(place);
                }}
              />
            ))}
          </div>

          <footer className="mt-14 flex flex-col items-center gap-4 border-t border-brand-border/40 pt-12 text-center">
            <p className="text-sm text-brand-text-secondary">
              There&apos;s more to discover.
            </p>
            <button
              type="button"
              className={buttonStyles.secondary}
              onClick={() => {
                void handleExploreMore();
              }}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? "Gathering more…" : "Explore More"}
            </button>
          </footer>
        </>
      ) : (
        <div className="rounded-3xl border border-dashed border-brand-border/70 bg-brand-card/40 px-6 py-14 text-center">
          <p className="font-display text-2xl font-light text-brand-text-primary">
            Search a place to begin
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-brand-text-secondary">
            Enter a country, city, or route. We&apos;ll gather places worth
            lingering with — then you can add them to a journey or save them for
            later.
          </p>
        </div>
      )}

      <ExploreIntentionModal
        open={intentionOpen}
        destination={query.trim()}
        initialFilters={activeFilters}
        onClose={() => setIntentionOpen(false)}
        onExplore={(filters) => {
          void runSearch(query, filters);
        }}
        onExploreOpen={() => {
          void runSearch(query, []);
        }}
      />
    </div>
  );
}
