"use client";

import { surfaces } from "@/lib/design";
import type { DiscoveryPlace } from "./discovery-data";

type DiscoveryPlaceCardProps = {
  place: DiscoveryPlace;
  inJourney: boolean;
  inWishlist: boolean;
  onToggleJourney: () => void;
  onToggleWishlist: () => void;
};

const actionButtonClass = [
  "inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-full",
  "border border-brand-border px-3 text-[0.75rem] font-medium tracking-wide",
  "text-brand-text-secondary transition-colors duration-200",
  "hover:border-brand-text-secondary hover:text-brand-text-primary",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary",
].join(" ");

const actionActiveClass = [
  "inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-full",
  "border border-brand-btn-primary/40 bg-brand-btn-primary/10 px-3",
  "text-[0.75rem] font-medium tracking-wide text-brand-btn-primary",
  "transition-colors duration-200",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary",
].join(" ");

/**
 * Discovery place card with local journey / wishlist UI state.
 */
export function DiscoveryPlaceCard({
  place,
  inJourney,
  inWishlist,
  onToggleJourney,
  onToggleWishlist,
}: DiscoveryPlaceCardProps) {
  return (
    <article
      className={[
        "flex h-full flex-col overflow-hidden rounded-3xl border p-5 sm:p-6",
        "transition-[border-color,background-color] duration-300",
        inJourney
          ? "border-brand-btn-primary/50 bg-brand-btn-primary/[0.06] shadow-sm"
          : "border-brand-card-border bg-brand-card shadow-card",
      ].join(" ")}
    >
      <span className={`${surfaces.chip} mb-3 inline-flex w-fit`}>
        {place.category}
      </span>

      <h3 className="font-display text-xl font-light tracking-tight text-brand-text-primary">
        {place.title}
      </h3>

      <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-text-secondary">
        {place.description}
      </p>

      {place.highlights.length > 0 && (
        <ul className="mt-4 space-y-1.5 border-t border-brand-border/40 pt-4">
          {place.highlights.map((highlight) => (
            <li
              key={highlight}
              className="text-xs leading-snug text-brand-text-secondary"
            >
              {highlight}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex gap-2 border-t border-brand-border/30 pt-4">
        <button
          type="button"
          onClick={onToggleJourney}
          aria-pressed={inJourney}
          className={inJourney ? actionActiveClass : actionButtonClass}
        >
          {inJourney ? (
            <>
              <span aria-hidden>✓</span>
              Added to Journey
            </>
          ) : (
            "Add to Journey"
          )}
        </button>

        <button
          type="button"
          onClick={onToggleWishlist}
          aria-pressed={inWishlist}
          className={inWishlist ? actionActiveClass : actionButtonClass}
        >
          {inWishlist ? (
            <>
              <span aria-hidden>♥</span>
              In Wishlist
            </>
          ) : (
            "Add to Wishlist"
          )}
        </button>
      </div>
    </article>
  );
}

export function DiscoveryPlaceSkeleton() {
  return (
    <div
      className={`${surfaces.card} flex h-full flex-col overflow-hidden p-5 sm:p-6`}
      aria-hidden
    >
      <div className="mb-3 h-5 w-20 animate-pulse rounded-full bg-brand-border/50" />
      <div className="h-7 w-3/4 animate-pulse rounded bg-brand-border/40" />
      <div className="mt-3 space-y-2">
        <div className="h-3.5 w-full animate-pulse rounded bg-brand-border/35" />
        <div className="h-3.5 w-5/6 animate-pulse rounded bg-brand-border/35" />
        <div className="h-3.5 w-2/3 animate-pulse rounded bg-brand-border/35" />
      </div>
      <div className="mt-4 space-y-2 border-t border-brand-border/40 pt-4">
        <div className="h-3 w-1/2 animate-pulse rounded bg-brand-border/30" />
        <div className="h-3 w-2/5 animate-pulse rounded bg-brand-border/30" />
      </div>
      <div className="mt-auto flex gap-2 border-t border-brand-border/30 pt-4">
        <div className="h-10 flex-1 animate-pulse rounded-full bg-brand-border/30" />
        <div className="h-10 flex-1 animate-pulse rounded-full bg-brand-border/30" />
      </div>
    </div>
  );
}
