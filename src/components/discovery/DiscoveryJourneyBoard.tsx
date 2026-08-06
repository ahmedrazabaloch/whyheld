"use client";

import { useEffect, useState } from "react";
import { Check, Pencil } from "lucide-react";
import { buttonStyles } from "@/lib/design";
import { renameJourneyTitle, saveDiscoveryState } from "@/actions/journey-actions";
import type { DiscoveryBoardStatus, DiscoveryPlace } from "./discovery-data";

const placesScrollClass = [
  "min-h-0 flex-1 overflow-y-auto",
  "[scrollbar-width:thin] [scrollbar-color:var(--color-brand-btn-primary)_var(--color-brand-border)]",
  "[&::-webkit-scrollbar]:w-1.5",
  "[&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-brand-border/40",
  "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-brand-btn-primary/70",
  "[&::-webkit-scrollbar-thumb]:hover:bg-brand-btn-primary",
].join(" ");

type DiscoveryJourneyBoardProps = {
  journeyId: string;
  title: string;
  destination: string;
  places: DiscoveryPlace[];
  boardStatus: DiscoveryBoardStatus;
  onTitleChange: (title: string) => void;
  onBoardStatusChange: (status: DiscoveryBoardStatus) => void;
  onRemovePlace: (placeId: string) => void;
  doneExploring?: {
    label: string;
    busyLabel: string;
    disabled: boolean;
    busy: boolean;
    onClick: () => void;
  };
};

export function DiscoveryJourneyBoard({
  journeyId,
  title,
  destination,
  places,
  boardStatus,
  onTitleChange,
  onBoardStatusChange,
  onRemovePlace,
  doneExploring,
}: DiscoveryJourneyBoardProps) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraftTitle(title);
  }, [title]);

  const commitTitle = async () => {
    const next = draftTitle.trim() || `Journey to ${destination}`;
    setEditing(false);
    if (next === title) return;
    onTitleChange(next);
    setSaving(true);
    try {
      await renameJourneyTitle(journeyId, next);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async () => {
    const next: DiscoveryBoardStatus =
      boardStatus === "COMPLETE" ? "PENDING" : "COMPLETE";
    onBoardStatusChange(next);
    await saveDiscoveryState(journeyId, { boardStatus: next });
  };

  return (
    <div
      className="flex max-h-[min(32rem,calc(100vh-8rem))] flex-col overflow-hidden rounded-2xl border border-brand-border/60 bg-brand-card p-5 shadow-sm lg:max-h-[calc(100vh-6rem)]"
      style={{
        background: "rgba(255, 255, 255, 0.72)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Fixed header — journey name stays visible */}
      <div className="shrink-0">
        <div className="mb-4 flex items-start justify-between gap-3">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-brand-text-secondary/80">
            Your journey card
          </p>
          <button
            type="button"
            onClick={() => {
              void toggleStatus();
            }}
            className={[
              "rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] transition-colors",
              boardStatus === "COMPLETE"
                ? "bg-brand-btn-primary/15 text-brand-btn-primary"
                : "bg-brand-text-primary/5 text-brand-text-secondary",
            ].join(" ")}
          >
            {boardStatus === "COMPLETE" ? "Complete" : "Pending"}
          </button>
        </div>

        {editing ? (
          <div className="flex items-center gap-2">
            <input
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void commitTitle();
                if (e.key === "Escape") {
                  setDraftTitle(title);
                  setEditing(false);
                }
              }}
              className="w-full rounded-xl border border-brand-border bg-brand-bg px-3 py-2 font-display text-lg text-brand-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary"
              autoFocus
              aria-label="Journey card name"
            />
            <button
              type="button"
              onClick={() => {
                void commitTitle();
              }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-btn-primary text-brand-bg"
              aria-label="Save name"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="group flex w-full items-start gap-2 text-left"
          >
            <h2 className="font-display text-xl font-light leading-snug tracking-tight text-brand-text-primary">
              {title}
              {saving ? (
                <span className="ml-2 text-xs text-brand-text-secondary">Saving…</span>
              ) : null}
            </h2>
            <Pencil
              className="mt-1.5 h-3.5 w-3.5 shrink-0 text-brand-text-secondary opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden
            />
          </button>
        )}

        <p className="mt-1 text-xs text-brand-text-secondary">{destination}</p>

        <div className="mt-5 border-t border-brand-border/40 pt-4">
          <p className="mb-3 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-brand-text-secondary/80">
            Added places
          </p>
        </div>
      </div>

      {/* Only the place list scrolls */}
      <div className={placesScrollClass}>
        {places.length === 0 ? (
          <p className="text-sm leading-relaxed text-brand-text-secondary">
            Click Add to Journey on a place — it will appear here on this card.
          </p>
        ) : (
          <ul className="space-y-2.5 pr-1">
            {places.map((place) => (
              <li
                key={place.id}
                className="flex items-start justify-between gap-2 rounded-xl border border-brand-border/50 bg-brand-bg/60 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-brand-text-primary">
                    {place.title}
                  </p>
                  <p className="truncate text-[0.7rem] text-brand-text-secondary">
                    {place.category}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemovePlace(place.id)}
                  aria-label={`Remove ${place.title}`}
                  title="Remove"
                  className="shrink-0 rounded-full p-1.5 text-brand-text-secondary transition-colors hover:bg-brand-border/40 hover:text-brand-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {doneExploring ? (
        <div className="mt-4 shrink-0 border-t border-brand-border/40 pt-4">
          <button
            type="button"
            className={`${buttonStyles.primary} w-full`}
            onClick={doneExploring.onClick}
            disabled={doneExploring.disabled || doneExploring.busy}
          >
            {doneExploring.busy ? doneExploring.busyLabel : doneExploring.label}
          </button>
        </div>
      ) : null}
    </div>
  );
}
