"use client";

import { useState } from "react";
import { toast } from "sonner";
import { saveStopAsPlace } from "@/actions/place-actions";

export interface PointOfInterest {
  name: string;
  description: string;
}

export interface JourneyStopCardProps {
  stopId?: string;
  order: number;
  name: string;
  kind?: string;
  description: string;
  highlights?: string[];
  metadata?: any;
  googlePlaceId?: string;
  latitude?: number;
  longitude?: number;
}

export function JourneyStopCard({
  stopId,
  order,
  name,
  kind,
  description,
  highlights,
  metadata,
  googlePlaceId,
  latitude,
  longitude,
}: JourneyStopCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const morning = metadata?.morning;
  const afternoon = metadata?.afternoon;
  const evening = metadata?.evening;
  const travelNotes = metadata?.travelNotes;
  const localTips = metadata?.localTips;
  const hiddenGems = metadata?.hiddenGems;
  const logistics = metadata?.logistics;
  const pointsOfInterest: PointOfInterest[] | undefined = Array.isArray(
    metadata?.pointsOfInterest
  )
    ? metadata.pointsOfInterest
    : undefined;

  const hasStructuredTime = morning || afternoon || evening;

  const handleSaveStop = async () => {
    if (isSaving) return;
    setIsSaving(true);
    const prevSaved = isSaved;
    setIsSaved(!prevSaved); // Optimistic UI

    try {
      const res = await saveStopAsPlace({
        name,
        description,
        kind,
        googlePlaceId,
        latitude,
        longitude,
      });

      if (res.success) {
        toast.success(
          res.data?.saved
            ? `Saved "${name}" to Wishlist`
            : `Removed "${name}" from Wishlist`,
        );
        if (res.data && !res.data.saved) {
          setIsSaved(false);
        }
      } else {
        setIsSaved(prevSaved);
        toast.error(res.error || "Failed to update Wishlist");
      }
    } catch {
      setIsSaved(prevSaved);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="overflow-hidden mb-6 p-6 sm:p-7 relative rounded-3xl transition-all duration-300"
      style={{
        background: "rgba(255, 255, 255, 0.95)",
        border: "1px solid rgba(216, 210, 200, 0.6)",
        boxShadow: "0 10px 40px -12px rgba(51, 51, 47, 0.08)",
      }}
    >
      {/* Accent line */}
      <div
        className="absolute top-0 left-0 w-[4px] h-full rounded-l-3xl"
        style={{ background: "rgba(116, 135, 107, 0.85)" }}
      />

      <div className="mb-4 ml-1">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            {kind && (
              <span
                className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full"
                style={{
                  color: "rgba(116, 135, 107, 0.9)",
                  background: "rgba(244, 241, 235, 0.8)",
                  border: "1px solid rgba(216, 210, 200, 0.5)",
                }}
              >
                {kind.replace(/_/g, " ")}
              </span>
            )}
            {logistics?.estimatedCost && (
              <span className="text-xs text-brand-text-secondary bg-brand-bg/80 border border-brand-border/40 px-2.5 py-0.5 rounded-full font-medium">
                🏷️ {logistics.estimatedCost}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleSaveStop}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-border/20 cursor-pointer"
            title={isSaved ? "In Wishlist" : "Add to Wishlist"}
          >
            <BookmarkIcon saved={isSaved} />
            <span className="hidden sm:inline">{isSaved ? "Wishlisted" : "Wishlist"}</span>
          </button>
        </div>

        <h4 className="font-display text-2xl font-normal tracking-[-0.01em] text-brand-text-primary">
          {name}
        </h4>
      </div>

      <div className="ml-1">
        {description && (
          <p className="text-sm leading-relaxed mb-4 text-brand-text-secondary/90 font-light">
            {description}
          </p>
        )}

        {/* Flowing Narrative Prose instead of standalone uppercase labels */}
        {hasStructuredTime && (
          <div className="my-4 space-y-2.5 text-sm leading-relaxed text-brand-text-secondary/90 font-light p-4 rounded-2xl bg-[#F8F6F0]/70 border border-brand-border/40">
            {morning && (
              <p>
                <span className="italic font-medium text-brand-text-primary">
                  In the morning,
                </span>{" "}
                {morning}
              </p>
            )}
            {afternoon && (
              <p>
                <span className="italic font-medium text-brand-text-primary">
                  In the afternoon,
                </span>{" "}
                {afternoon}
              </p>
            )}
            {evening && (
              <p>
                <span className="italic font-medium text-brand-text-primary">
                  In the evening,
                </span>{" "}
                {evening}
              </p>
            )}
          </div>
        )}

        {/* Points of Interest Sub-Cards */}
        {pointsOfInterest && pointsOfInterest.length > 0 && (
          <div className="my-5 pl-3 sm:pl-4 border-l-2 border-[#74876B]/40 space-y-2.5">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#74876B]">
              Points of Interest
            </p>
            <div className="space-y-2.5">
              {pointsOfInterest.map((poi, idx) => (
                <PoiSubCard key={idx} poi={poi} parentKind={kind} />
              ))}
            </div>
          </div>
        )}

        {/* Fallback to free-text hiddenGems when pointsOfInterest absent */}
        {hiddenGems && (!pointsOfInterest || pointsOfInterest.length === 0) && (
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-950 flex items-start gap-3 my-3">
            <span className="shrink-0 text-base">💎</span>
            <div>
              <strong className="font-semibold uppercase tracking-wider text-[0.65rem] block mb-0.5 text-amber-900">
                Hidden Gem
              </strong>
              <p className="leading-relaxed font-light">{hiddenGems}</p>
            </div>
          </div>
        )}

        {/* Elevated Local Tip & Travel Notes */}
        {(localTips || travelNotes) && (
          <div className="space-y-3 my-4">
            {localTips && (
              <div className="p-4 rounded-2xl bg-[#74876B]/10 border border-[#74876B]/25 text-xs text-brand-text-primary flex items-start gap-3 shadow-xs">
                <span className="shrink-0 text-base">💡</span>
                <div>
                  <strong className="font-semibold uppercase tracking-[0.18em] text-[0.65rem] block mb-1 text-[#74876B]">
                    Local Tip
                  </strong>
                  <p className="leading-relaxed text-brand-text-secondary font-light">
                    {localTips}
                  </p>
                </div>
              </div>
            )}

            {travelNotes && (
              <div className="p-4 rounded-2xl bg-brand-card/90 border border-brand-border/60 text-xs text-brand-text-primary flex items-start gap-3 shadow-xs">
                <span className="shrink-0 text-base">🧭</span>
                <div>
                  <strong className="font-semibold uppercase tracking-[0.18em] text-[0.65rem] block mb-1 text-brand-text-primary">
                    Travel Notes
                  </strong>
                  <p className="leading-relaxed text-brand-text-secondary font-light">
                    {travelNotes}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Highlights */}
        {highlights && highlights.length > 0 && (
          <div className="mt-4 pt-4 border-t border-brand-border/40">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.25em] mb-2 text-brand-text-secondary/80">
              Highlights
            </p>
            <ul className="space-y-1.5">
              {highlights.map((highlight, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-brand-text-secondary"
                >
                  <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-brand-btn-primary/70" />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function PoiSubCard({
  poi,
  parentKind,
}: {
  poi: PointOfInterest;
  parentKind?: string;
}) {
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSavePoi = async () => {
    if (isSaving) return;
    setIsSaving(true);
    const prevSaved = isSaved;
    setIsSaved(!prevSaved);

    try {
      const res = await saveStopAsPlace({
        name: poi.name,
        description: poi.description,
        kind: "POINT_OF_INTEREST",
      });

      if (res.success) {
        toast.success(
          res.data?.saved
            ? `Saved "${poi.name}" to Wishlist`
            : `Removed "${poi.name}" from Wishlist`,
        );
        if (res.data && !res.data.saved) {
          setIsSaved(false);
        }
      } else {
        setIsSaved(prevSaved);
        toast.error(res.error || "Failed to update Wishlist");
      }
    } catch {
      setIsSaved(prevSaved);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-3.5 rounded-2xl bg-[#74876B]/10 border border-[#74876B]/25 text-xs flex items-start justify-between gap-3 transition-all duration-200 hover:border-[#74876B]/45">
      <div className="flex items-start gap-2.5">
        <span className="shrink-0 text-sm mt-0.5">📍</span>
        <div>
          <h5 className="font-medium text-brand-text-primary text-sm tracking-tight mb-0.5">
            {poi.name}
          </h5>
          <p className="text-brand-text-secondary leading-relaxed font-light">
            {poi.description}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleSavePoi}
        disabled={isSaving}
        className="shrink-0 p-1.5 rounded-full hover:bg-brand-text-primary/10 text-brand-text-secondary transition-colors cursor-pointer"
        title={isSaved ? "In Wishlist" : "Add to Wishlist"}
      >
        <BookmarkIcon saved={isSaved} />
      </button>
    </div>
  );
}

function BookmarkIcon({ saved }: { saved: boolean }) {
  if (saved) {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="#74876B"
        stroke="#74876B"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
      </svg>
    );
  }
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
    </svg>
  );
}
