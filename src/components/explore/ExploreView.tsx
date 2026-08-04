"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { buttonStyles, formStyles } from "@/lib/design";
import { EmptyState } from "@/components/dashboard";
import {
  DiscoveryPlaceCard,
  DiscoveryPlaceSkeleton,
} from "@/components/discovery/DiscoveryPlaceCard";
import { JourneyPickerModal } from "@/components/discovery/JourneyPickerModal";
import type { DiscoveryPlace } from "@/components/discovery/discovery-data";
import { addPlaceToJourneyBoard } from "@/actions/journey-actions";
import { toggleWishlistPlace } from "@/actions/place-actions";
import { LocationAutocomplete } from "@/components/location/LocationAutocomplete";
import {
  EXPLORE_FILTERS,
  exploreFilterLabels,
} from "@/lib/explore/filters";
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

type PreferredAddTarget = { id: string; title: string };

const EXPLORE_ADD_TARGET_KEY = "wayheld:explore-add-target";

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase();
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

function readPreferredAddTarget(): PreferredAddTarget | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(EXPLORE_ADD_TARGET_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PreferredAddTarget;
    if (!parsed?.id?.trim()) return null;
    return {
      id: parsed.id.trim(),
      title: parsed.title?.trim() || "your journey",
    };
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
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [places, setPlaces] = useState<DiscoveryPlace[]>([]);
  const [journeyIds, setJourneyIds] = useState<Set<string>>(new Set());
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [failed, setFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pickerPlace, setPickerPlace] = useState<DiscoveryPlace | null>(null);
  const [preferredAddTarget, setPreferredAddTarget] =
    useState<PreferredAddTarget | null>(null);
  const [addBusyId, setAddBusyId] = useState<string | null>(null);
  const [wishlistBusyId, setWishlistBusyId] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    setPreferredAddTarget(readPreferredAddTarget());
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

  const toggleFilter = (id: string) => {
    setSelectedFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  };

  const runSearch = useCallback(
    async (rawDestination: string) => {
      const destination = rawDestination.trim();
      if (destination.length < 2 || isLoading) return;

      setQuery(destination);
      setIsLoading(true);
      setFailed(false);
      setErrorMessage(null);
      setPlaces([]);
      setJourneyIds(new Set());
      setWishlistIds(new Set());
      clearPreferredAddTarget();
      setPreferredAddTarget(null);
      setActiveDestination(destination);

      try {
        const raw = await requestPlaces({
          destination,
          count: 10,
          excludeTitles: [],
          selectedTitles: [],
          wishlistTitles: [],
          filters: selectedFilters,
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
    [isLoading, selectedFilters],
  );

  const handleSearch = async (event?: FormEvent) => {
    event?.preventDefault();
    await runSearch(query);
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
        filters: selectedFilters,
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

  const addPlaceToPreferredOrAsk = useCallback(
    async (place: DiscoveryPlace) => {
      const preferred = preferredAddTarget || readPreferredAddTarget();

      if (!preferred) {
        setPickerPlace(place);
        return;
      }

      setAddBusyId(place.id);
      try {
        const res = await addPlaceToJourneyBoard({
          targetJourneyId: preferred.id,
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
        if (!res.success) {
          clearPreferredAddTarget();
          setPreferredAddTarget(null);
          setPickerPlace(place);
          return;
        }
        rememberAddTarget(preferred);
        markAdded(place.id);
        toast.success(`Added “${place.title}” to ${preferred.title}`);
      } finally {
        setAddBusyId(null);
      }
    },
    [preferredAddTarget, rememberAddTarget, markAdded],
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

  const chipClass = (selected?: boolean) =>
    [
      "rounded-full border px-3.5 py-2 text-xs font-medium tracking-wide transition-colors",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary",
      selected
        ? "border-brand-btn-primary bg-brand-btn-primary/15 text-brand-text-primary"
        : "border-brand-border/80 bg-brand-card text-brand-text-secondary hover:border-brand-text-secondary hover:text-brand-text-primary",
    ].join(" ");

  return (
    <div className="w-full pb-16">
      <form
        onSubmit={(e) => {
          void handleSearch(e);
        }}
        className="mb-10 rounded-2xl border border-brand-btn-primary/25 bg-brand-btn-primary/[0.08] p-6 shadow-sm sm:p-8"
      >
        <h2 className="font-display text-2xl font-light tracking-tight text-brand-text-primary sm:text-3xl">
          Where would you like to wander?
        </h2>

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

        <div className="mt-7 border-t border-brand-border/50 pt-6">
          <p className={formStyles.label}>Refine suggestions</p>
          <p className={`${formStyles.hint} mt-1.5`}>
            Tap chips to focus the kinds of places we gather for this search.
          </p>
          <div
            role="group"
            aria-label="Explore filters"
            className="mt-3 flex flex-wrap gap-2"
          >
            {EXPLORE_FILTERS.map((filter) => {
              const selected = selectedFilters.includes(filter.id);
              return (
                <button
                  key={filter.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleFilter(filter.id)}
                  className={chipClass(selected)}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
          {selectedFilters.length > 0 ? (
            <p className={`${formStyles.hint} mt-3`}>
              Looking toward {exploreFilterLabels(selectedFilters).join(" · ")}.
            </p>
          ) : null}
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
                void handleSearch();
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

          <div className="grid grid-cols-1 gap-5">
            {places.map((place) => (
              <DiscoveryPlaceCard
                key={place.id}
                place={place}
                inJourney={journeyIds.has(place.id)}
                inWishlist={wishlistIds.has(place.id)}
                addBusy={addBusyId === place.id}
                onAddToJourney={() => {
                  void addPlaceToPreferredOrAsk(place);
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

      <JourneyPickerModal
        open={!!pickerPlace}
        destinationHint={activeDestination || query}
        place={pickerPlace}
        onClose={() => setPickerPlace(null)}
        onCreatedOrMoved={(targetId, journeyTitle) => {
          const placeTitle = pickerPlace?.title || "Place";
          rememberAddTarget({
            id: targetId,
            title: journeyTitle || "your journey",
          });
          if (pickerPlace) markAdded(pickerPlace.id);
          toast.success(
            `Added “${placeTitle}” to ${journeyTitle || "your journey"}`,
          );
        }}
      />
    </div>
  );
}
