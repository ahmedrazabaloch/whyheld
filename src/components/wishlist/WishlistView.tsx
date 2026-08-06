"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { surfaces, buttonStyles, formStyles } from "@/lib/design";
import { removeSavedPlace } from "@/actions/place-actions";
import type { WishlistItemView } from "@/lib/wishlist/types";
import type { DiscoveryPlace } from "@/components/discovery/discovery-data";
import { JourneyPickerModal } from "@/components/discovery/JourneyPickerModal";

type SortMode = "newest" | "oldest";

type Props = {
  items: WishlistItemView[];
};

function toDiscoveryPlace(item: WishlistItemView): DiscoveryPlace {
  return {
    id: item.discoveryPlaceId || `wishlist-${item.id}`,
    category: item.category,
    title: item.title,
    description: item.description,
    highlights: [],
  };
}

export function WishlistView({ items: initialItems }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [itemsSnapshot, setItemsSnapshot] = useState(initialItems);
  const [query, setQuery] = useState("");
  const [destination, setDestination] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<SortMode>("newest");
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pickerItem, setPickerItem] = useState<WishlistItemView | null>(null);

  if (initialItems !== itemsSnapshot) {
    setItemsSnapshot(initialItems);
    setItems(initialItems);
  }

  const destinations = useMemo(() => {
    const set = new Set(items.map((i) => i.destination).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = items.filter((item) => {
      if (destination !== "all" && item.destination !== destination) return false;
      if (category !== "all" && item.category !== category) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.destination.toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sort === "newest" ? db - da : da - db;
    });
  }, [items, query, destination, category, sort]);

  const fromDiscovery = filtered.filter((i) => i.source === "discovery");
  const fromJourneys = filtered.filter((i) => i.source === "journey");

  const finishMoveToJourney = (journeyTitle: string, dayNumber?: number) => {
    const item = pickerItem;
    if (!item) return;

    setPickerItem(null);
    setBusyId(item.id);
    startTransition(async () => {
      const res = await removeSavedPlace(item.id);
      if (res.success) {
        setItems((prev) => prev.filter((p) => p.id !== item.id));
        const destinationLabel = dayNumber
          ? `Day ${dayNumber} of ${journeyTitle || "your journey"}`
          : journeyTitle || "your journey";
        toast.success(`Added “${item.title}” to ${destinationLabel}`);
        router.refresh();
      } else {
        toast.error(
          res.error ||
            "Added to the journey, but could not remove it from Wishlist.",
        );
      }
      setBusyId(null);
    });
  };

  if (items.length === 0) {
    return (
      <div className={`${surfaces.card} px-6 py-16 text-center sm:px-10 sm:py-20`}>
        <p className="font-display text-2xl text-brand-text-primary sm:text-3xl">
          Nothing waiting here yet.
        </p>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-brand-text-secondary">
          Save places that feel meaningful during Discovery or while reading a Journey.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/journeys" className={buttonStyles.primary}>
            Open journeys
          </Link>
          <Link href="/journeys/new" className={buttonStyles.secondary}>
            Begin exploring
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Filters */}
      <div className={`${surfaces.card} space-y-4 p-5 sm:p-6`}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className={formStyles.label}>Search</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Title or destination"
              className={`${formStyles.input} mt-2`}
            />
          </label>

          <label className="block">
            <span className={formStyles.label}>Destination</span>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className={`${formStyles.input} mt-2`}
            >
              <option value="all">All destinations</option>
              {destinations.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className={formStyles.label}>Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`${formStyles.input} mt-2`}
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className={formStyles.label}>Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortMode)}
              className={`${formStyles.input} mt-2`}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </label>
        </div>

        <p className="text-xs text-brand-text-secondary">
          {filtered.length} place{filtered.length !== 1 ? "s" : ""}
          {filtered.length !== items.length ? ` of ${items.length}` : ""}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-brand-text-secondary">
          No places match these filters. Try widening your search.
        </p>
      ) : (
        <div className="space-y-12">
          {fromDiscovery.length > 0 ? (
            <WishlistSection
              title="Saved from Discovery"
              items={fromDiscovery}
              busyId={busyId}
              pending={pending}
              onAddToJourney={setPickerItem}
            />
          ) : null}

          {fromJourneys.length > 0 ? (
            <WishlistSection
              title="Saved from Journeys"
              items={fromJourneys}
              busyId={busyId}
              pending={pending}
              onAddToJourney={setPickerItem}
            />
          ) : null}
        </div>
      )}

      <JourneyPickerModal
        open={!!pickerItem}
        destinationHint={pickerItem?.destination}
        place={pickerItem ? toDiscoveryPlace(pickerItem) : null}
        onClose={() => setPickerItem(null)}
        onCreatedOrMoved={(_journeyId, journeyTitle, dayNumber) => {
          finishMoveToJourney(journeyTitle, dayNumber);
        }}
      />
    </div>
  );
}

function WishlistSection({
  title,
  items,
  busyId,
  pending,
  onAddToJourney,
}: {
  title: string;
  items: WishlistItemView[];
  busyId: string | null;
  pending: boolean;
  onAddToJourney: (item: WishlistItemView) => void;
}) {
  return (
    <section>
      <header className="mb-5">
        <h2 className="font-display text-xl text-brand-text-primary sm:text-2xl">
          {title}
        </h2>
        <p className="mt-1 text-xs text-brand-text-secondary">
          {items.length} place{items.length !== 1 ? "s" : ""}
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {items.map((item) => {
          const isBusy = pending && busyId === item.id;
          return (
            <li key={item.id} className={`${surfaces.card} flex flex-col p-6`}>
              <div className="mb-3 flex items-start justify-between gap-3">
                <span className={surfaces.chip}>{item.category}</span>
                <span className="text-[0.65rem] text-brand-text-secondary/70">
                  {item.dateAdded}
                </span>
              </div>

              <h3 className="font-display text-xl text-brand-text-primary">
                {item.title}
              </h3>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-brand-text-secondary/80">
                {item.destination}
              </p>
              {item.description ? (
                <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-brand-text-secondary">
                  {item.description}
                </p>
              ) : null}

              <p className="mt-4 text-[0.65rem] font-medium uppercase tracking-[0.16em] text-brand-text-secondary/75">
                Source · {item.source === "discovery" ? "Discovery" : "Journey"}
              </p>

              <div className="mt-5 border-t border-brand-border/40 pt-4">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => onAddToJourney(item)}
                  className={[
                    "inline-flex min-h-[40px] w-full items-center justify-center rounded-full px-4",
                    "border border-brand-btn-primary bg-brand-btn-primary",
                    "text-[0.75rem] font-medium tracking-wide text-brand-bg shadow-sm",
                    "transition-colors duration-200 hover:bg-brand-btn-primary-hover",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary",
                    "disabled:cursor-not-allowed disabled:opacity-55",
                    "sm:w-auto",
                  ].join(" ")}
                >
                  {isBusy ? "Adding…" : "Add to Journey"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
