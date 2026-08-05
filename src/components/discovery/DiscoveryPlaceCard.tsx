"use client";

import { CloudSun, Heart, Lightbulb, MapPinned } from "lucide-react";
import type { ReactNode } from "react";
import { surfaces } from "@/lib/design";
import type { DiscoveryPlace } from "./discovery-data";

type DiscoveryPlaceCardProps = {
  place: DiscoveryPlace;
  inJourney: boolean;
  inWishlist: boolean;
  addBusy?: boolean;
  onAddToJourney: () => void;
  onRemoveFromJourney: () => void;
  onToggleWishlist: () => void;
};

const actionPrimaryClass = [
  "inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-full",
  "border border-brand-btn-primary bg-brand-btn-primary px-3",
  "text-[0.75rem] font-medium tracking-wide text-brand-bg shadow-sm",
  "transition-colors duration-200 hover:bg-brand-btn-primary-hover",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary",
  "disabled:cursor-not-allowed disabled:opacity-55",
].join(" ");

const actionActiveClass = [
  "inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-full",
  "border border-brand-btn-primary/40 bg-brand-btn-primary/10 px-3",
  "text-[0.75rem] font-medium tracking-wide text-brand-btn-primary",
  "transition-colors duration-200",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary",
  "disabled:cursor-not-allowed disabled:opacity-55",
].join(" ");

/** Highlight place/city names trailing poetic titles after at/in/near/to/from. */
function renderPlaceTitle(title: string): ReactNode {
  const re = /\b(at|in|near|to|from)\s+/gi;
  let last: RegExpExecArray | null = null;
  let match: RegExpExecArray | null;
  while ((match = re.exec(title)) !== null) {
    last = match;
  }
  if (!last) return title;

  const placeStart = last.index + last[0].length;
  const lead = title.slice(0, placeStart);
  const place = title.slice(placeStart).trim();
  if (place.length < 2) return title;

  const looksNamed =
    /[A-ZÀ-ÖØ-Þ]/.test(place) || place.split(/\s+/).filter(Boolean).length >= 2;
  if (!looksNamed) return title;

  return (
    <>
      {lead}
      <span className="font-semibold text-brand-btn-primary">{place}</span>
    </>
  );
}

function DetailBlock({
  icon,
  label,
  text,
}: {
  icon: ReactNode;
  label: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-brand-border/40 bg-brand-bg/50 px-3.5 py-3">
      <p className="mb-1.5 flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-brand-text-secondary">
        <span className="text-brand-btn-primary" aria-hidden>
          {icon}
        </span>
        {label}
      </p>
      <p className="text-xs leading-relaxed text-brand-text-primary/90">{text}</p>
    </div>
  );
}

function CardActions({
  inJourney,
  inWishlist,
  addBusy,
  onAddToJourney,
  onRemoveFromJourney,
  onToggleWishlist,
}: {
  inJourney: boolean;
  inWishlist: boolean;
  addBusy: boolean;
  onAddToJourney: () => void;
  onRemoveFromJourney: () => void;
  onToggleWishlist: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={inJourney ? onRemoveFromJourney : onAddToJourney}
        aria-pressed={inJourney}
        disabled={addBusy}
        className={inJourney ? actionActiveClass : actionPrimaryClass}
      >
        {addBusy ? (
          "Adding…"
        ) : inJourney ? (
          <>
            <span aria-hidden>✓</span>
            On this journey
          </>
        ) : (
          "Add to Journey"
        )}
      </button>

      <button
        type="button"
        onClick={onToggleWishlist}
        aria-pressed={inWishlist}
        className={[
          "inline-flex min-h-[40px] shrink-0 items-center justify-center gap-1.5 rounded-full border px-3",
          "text-[0.75rem] font-medium tracking-wide transition-colors duration-200",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary",
          inWishlist
            ? "border-red-500/40 bg-red-500/10 text-red-500"
            : "border-brand-border text-brand-text-secondary hover:border-brand-text-secondary hover:text-brand-text-primary",
        ].join(" ")}
      >
        <Heart
          className="h-3.5 w-3.5"
          strokeWidth={1.75}
          fill={inWishlist ? "currentColor" : "none"}
          aria-hidden
        />
        {inWishlist ? "In Wishlist" : "Add to Wishlist"}
      </button>
    </div>
  );
}

/**
 * Discovery place card — full-width row with CTAs at the top.
 */
export function DiscoveryPlaceCard({
  place,
  inJourney,
  inWishlist,
  addBusy = false,
  onAddToJourney,
  onRemoveFromJourney,
  onToggleWishlist,
}: DiscoveryPlaceCardProps) {
  return (
    <article
      className={[
        "flex flex-col overflow-hidden rounded-3xl border p-5 sm:p-6",
        "transition-[border-color,background-color] duration-300",
        inJourney
          ? "border-brand-btn-primary/50 bg-brand-btn-primary/[0.06] shadow-sm"
          : "border-brand-card-border bg-brand-card shadow-card",
      ].join(" ")}
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className={`${surfaces.chip} inline-flex w-fit`}>
          {place.category}
        </span>
        <div className="w-full sm:w-auto sm:shrink-0">
          <CardActions
            inJourney={inJourney}
            inWishlist={inWishlist}
            addBusy={addBusy}
            onAddToJourney={onAddToJourney}
            onRemoveFromJourney={onRemoveFromJourney}
            onToggleWishlist={onToggleWishlist}
          />
        </div>
      </div>

      <h3 className="font-display text-2xl font-medium tracking-tight text-brand-text-primary">
        {renderPlaceTitle(place.title)}
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-brand-text-secondary">
        {place.description}
      </p>

      {place.highlights.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-brand-border/40 pt-4">
          {place.highlights.map((highlight) => (
            <span
              key={highlight}
              className="inline-flex max-w-full rounded-full border border-brand-btn-primary/25 bg-brand-btn-primary/10 px-3 py-1.5 text-[0.72rem] font-medium leading-snug tracking-wide text-brand-btn-primary"
            >
              {highlight}
            </span>
          ))}
        </div>
      )}

      {(place.localTips || place.guideNote || place.weatherNote) && (
        <div className="mt-4 grid gap-2.5">
          {place.localTips && (
            <DetailBlock
              icon={<Lightbulb className="h-3.5 w-3.5" strokeWidth={1.75} />}
              label="Local tip"
              text={place.localTips}
            />
          )}
          {place.guideNote && (
            <DetailBlock
              icon={<MapPinned className="h-3.5 w-3.5" strokeWidth={1.75} />}
              label="Guide note"
              text={place.guideNote}
            />
          )}
          {place.weatherNote && (
            <DetailBlock
              icon={<CloudSun className="h-3.5 w-3.5" strokeWidth={1.75} />}
              label="Season & weather"
              text={place.weatherNote}
            />
          )}
        </div>
      )}
    </article>
  );
}

export function DiscoveryPlaceSkeleton() {
  return (
    <div
      className={`${surfaces.card} flex flex-col overflow-hidden p-5 sm:p-6`}
      aria-hidden
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-5 w-20 animate-pulse rounded-full bg-brand-border/50" />
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <div className="h-10 w-28 animate-pulse rounded-full bg-brand-border/30" />
          <div className="h-10 w-28 animate-pulse rounded-full bg-brand-border/30" />
        </div>
      </div>
      <div className="h-8 w-3/4 animate-pulse rounded bg-brand-border/40" />
      <div className="mt-3 space-y-2">
        <div className="h-3.5 w-full animate-pulse rounded bg-brand-border/35" />
        <div className="h-3.5 w-5/6 animate-pulse rounded bg-brand-border/35" />
        <div className="h-3.5 w-2/3 animate-pulse rounded bg-brand-border/35" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <div className="h-7 w-28 animate-pulse rounded-full bg-brand-border/25" />
        <div className="h-7 w-24 animate-pulse rounded-full bg-brand-border/25" />
        <div className="h-7 w-32 animate-pulse rounded-full bg-brand-border/25" />
      </div>
    </div>
  );
}
