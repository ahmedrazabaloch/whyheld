"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { surfaces, buttonStyles, formStyles } from "@/lib/design";
import { removeSavedPlace } from "@/actions/place-actions";
import type { WishlistItemView } from "@/lib/wishlist/types";

type SortMode = "newest" | "oldest";

type Props = {
  items: WishlistItemView[];
};

export function WishlistView({ items: initialItems }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [itemsSnapshot, setItemsSnapshot] = useState(initialItems);
  const [query, setQuery] = useState("");
  const [destination, setDestination] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<SortMode>("newest");
  const [pending, startTransition] = useTransition();
  const [removingId, setRemovingId] = useState<string | null>(null);

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

  const handleRemove = (id: string) => {
    setRemovingId(id);
    startTransition(async () => {
      const res = await removeSavedPlace(id);
      if (res.success) {
        setItems((prev) => prev.filter((p) => p.id !== id));
        router.refresh();
      }
      setRemovingId(null);
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
              removingId={removingId}
              pending={pending}
              onRemove={handleRemove}
            />
          ) : null}

          {fromJourneys.length > 0 ? (
            <WishlistSection
              title="Saved from Journeys"
              items={fromJourneys}
              removingId={removingId}
              pending={pending}
              onRemove={handleRemove}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

function WishlistSection({
  title,
  items,
  removingId,
  pending,
  onRemove,
}: {
  title: string;
  items: WishlistItemView[];
  removingId: string | null;
  pending: boolean;
  onRemove: (id: string) => void;
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
        {items.map((item) => (
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

            <div className="mt-5 flex flex-wrap gap-2 border-t border-brand-border/40 pt-4">
              <button
                type="button"
                disabled={pending && removingId === item.id}
                onClick={() => onRemove(item.id)}
                className="inline-flex min-h-[40px] items-center rounded-full border border-brand-border px-3.5 text-xs font-medium text-brand-text-secondary transition-colors hover:border-brand-text-secondary hover:text-brand-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary disabled:opacity-50"
              >
                {removingId === item.id ? "Removing…" : "Remove from Wishlist"}
              </button>

              {item.journeyId ? (
                <>
                  <Link
                    href={`/journeys/${item.journeyId}`}
                    className="inline-flex min-h-[40px] items-center rounded-full border border-brand-border px-3.5 text-xs font-medium text-brand-text-secondary transition-colors hover:border-brand-text-secondary hover:text-brand-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary"
                  >
                    Open Journey
                  </Link>
                  {item.source === "discovery" ? (
                    <Link
                      href={`/journeys/${item.journeyId}/discover`}
                      className="inline-flex min-h-[40px] items-center rounded-full border border-brand-border px-3.5 text-xs font-medium text-brand-text-secondary transition-colors hover:border-brand-text-secondary hover:text-brand-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary"
                    >
                      Open Discovery
                    </Link>
                  ) : null}
                </>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
