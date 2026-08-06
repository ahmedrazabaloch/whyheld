"use client";

import { useEffect, useState } from "react";
import { buttonStyles } from "@/lib/design";
import {
  addPlaceToJourneyBoard,
  createJourneyBoardWithPlace,
  listJourneyPickerOptions,
  type JourneyPickerOption,
} from "@/actions/journey-actions";
import type { DiscoveryPlace } from "@/components/discovery/discovery-data";

type JourneyPickerModalProps = {
  open: boolean;
  /** Optional — when absent (Explore), no journey is marked current. */
  currentJourneyId?: string | null;
  currentJourneyTitle?: string;
  /** Used when creating a new journey without a source draft. */
  destinationHint?: string;
  place: DiscoveryPlace | null;
  onClose: () => void;
  onAddedToCurrent?: (placeId: string, journeyTitle: string) => void;
  /** dayNumber is set when the place landed on a day of a generated journey. */
  onCreatedOrMoved: (
    journeyId: string,
    journeyTitle: string,
    dayNumber?: number,
  ) => void;
};

export function JourneyPickerModal({
  open,
  currentJourneyId = null,
  currentJourneyTitle = "",
  destinationHint,
  place,
  onClose,
  onAddedToCurrent,
  onCreatedOrMoved,
}: JourneyPickerModalProps) {
  const [options, setOptions] = useState<JourneyPickerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset on close so the next open starts in the loading state rather than
    // briefly showing the previous journey list as ready.
    if (!open) {
      setLoading(true);
      setOptions([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      const res = await listJourneyPickerOptions(currentJourneyId);
      if (cancelled) return;
      if (res.success) setOptions(res.data);
      else setError(res.error || "Unable to load journeys.");
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, currentJourneyId]);

  if (!open || !place) return null;

  const placePayload = {
    id: place.id,
    category: place.category,
    title: place.title,
    description: place.description,
    highlights: place.highlights,
    localTips: place.localTips,
    guideNote: place.guideNote,
    weatherNote: place.weatherNote,
  };

  const chooseCurrent = (title: string) => {
    onAddedToCurrent?.(place.id, title);
    onClose();
  };

  const chooseExisting = async (opt: JourneyPickerOption) => {
    if (currentJourneyId && opt.id === currentJourneyId) {
      chooseCurrent(opt.title || currentJourneyTitle);
      return;
    }
    setBusyId(opt.id);
    setError(null);
    const res = await addPlaceToJourneyBoard({
      targetJourneyId: opt.id,
      place: placePayload,
    });
    setBusyId(null);
    if (!res.success) {
      setError(res.error || "Could not add place.");
      return;
    }
    onCreatedOrMoved(res.data.journeyId, opt.title, res.data.dayNumber);
    onClose();
  };

  const chooseNew = async () => {
    setBusyId("__new__");
    setError(null);
    const res = await createJourneyBoardWithPlace({
      ...(currentJourneyId ? { sourceJourneyId: currentJourneyId } : {}),
      ...(!currentJourneyId && destinationHint
        ? { destination: destinationHint }
        : {}),
      place: placePayload,
    });
    setBusyId(null);
    if (!res.success) {
      setError(res.error || "Could not create journey.");
      return;
    }
    onCreatedOrMoved(res.data.journeyId, res.data.title);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="journey-picker-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-brand-border bg-brand-card p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="journey-picker-title"
          className="font-display text-2xl font-light tracking-tight text-brand-text-primary"
        >
          Add to which journey?
        </h2>
        <p className="mt-2 text-sm text-brand-text-secondary">
          Choose an existing journey card, or start a new one for{" "}
          <span className="text-brand-text-primary">{place.title}</span>.
        </p>

        <div className="mt-5 max-h-[50vh] space-y-2 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-brand-text-secondary">Loading journeys…</p>
          ) : options.length === 0 ? (
            <p className="text-sm text-brand-text-secondary">
              No journeys yet — create a new one below.
            </p>
          ) : (
            options.map((opt) => {
              const isCurrent = !!currentJourneyId && opt.id === currentJourneyId;
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={busyId !== null}
                  onClick={() => {
                    void chooseExisting(opt);
                  }}
                  className={[
                    "flex w-full items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-colors",
                    isCurrent
                      ? "border-brand-btn-primary/50 bg-brand-btn-primary/10"
                      : "border-brand-border bg-brand-bg/40 hover:border-brand-text-secondary/50",
                    busyId === opt.id ? "opacity-60" : "",
                  ].join(" ")}
                >
                  <span>
                    <span className="block text-sm font-semibold text-brand-text-primary">
                      {opt.title}
                      {isCurrent ? " (this one)" : ""}
                    </span>
                    <span className="mt-0.5 block text-xs text-brand-text-secondary">
                      {opt.destination} · {opt.placeCount}{" "}
                      {opt.placeCount === 1 ? "place" : "places"}
                    </span>
                  </span>
                  <span className="text-[0.65rem] uppercase tracking-wide text-brand-text-secondary">
                    {opt.status === "DRAFT" ? "Draft" : opt.status.toLowerCase()}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-700/80" role="alert">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button type="button" className={buttonStyles.secondary} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={buttonStyles.primary}
            disabled={
              loading || busyId !== null || (!currentJourneyId && !destinationHint)
            }
            onClick={() => {
              void chooseNew();
            }}
          >
            {loading
              ? "Loading…"
              : busyId === "__new__"
                ? "Creating…"
                : "Create new journey"}
          </button>
        </div>
      </div>
    </div>
  );
}
