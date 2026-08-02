"use client";

import { useState } from "react";
import Link from "next/link";
import { buttonStyles, surfaces } from "@/lib/design";
import type { ComposedDay, ComposedPlaceSlot } from "@/lib/ai/schemas/composed-journey";
import type { DiscoveryPlace } from "@/components/discovery/discovery-data";

type Props = {
  day: ComposedDay;
  allDayNumbers: number[];
  availablePlaces: DiscoveryPlace[];
  regenerating: boolean;
  onRemove: (placeId: string) => void;
  onToggleLock: (placeId: string) => void;
  onReorder: (placeId: string, direction: "up" | "down") => void;
  onMove: (placeId: string, toDay: number) => void;
  onAdd: (place: DiscoveryPlace) => void;
  onRegenerateDay: () => void;
  discoverHref: string;
};

export function DayPlaceEditor({
  day,
  allDayNumbers,
  availablePlaces,
  regenerating,
  onRemove,
  onToggleLock,
  onReorder,
  onMove,
  onAdd,
  onRegenerateDay,
  discoverHref,
}: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const places = day.places ?? [];

  return (
    <div className="mt-6 rounded-2xl border border-brand-border/50 bg-brand-bg/40 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-brand-text-secondary/90">
          Places this day
        </p>
        <button
          type="button"
          disabled={regenerating}
          onClick={onRegenerateDay}
          className="inline-flex min-h-[36px] items-center rounded-full border border-brand-border px-3 text-xs font-medium text-brand-text-secondary transition-colors hover:border-brand-text-secondary hover:text-brand-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary disabled:opacity-50"
        >
          {regenerating ? "Regenerating…" : "Regenerate Day"}
        </button>
      </div>

      {places.length === 0 ? (
        <p className="mb-4 text-sm text-brand-text-secondary">
          No places assigned. Add one below, then regenerate this day.
        </p>
      ) : (
        <ul className="space-y-2">
          {places.map((place, index) => (
            <PlaceEditRow
              key={place.id}
              place={place}
              index={index}
              total={places.length}
              dayNumber={day.dayNumber}
              allDayNumbers={allDayNumbers}
              onRemove={() => onRemove(place.id)}
              onToggleLock={() => onToggleLock(place.id)}
              onReorder={(dir) => onReorder(place.id, dir)}
              onMove={(to) => onMove(place.id, to)}
            />
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-brand-border/40 pt-4">
        <button
          type="button"
          onClick={() => setAddOpen((v) => !v)}
          className="inline-flex min-h-[40px] items-center rounded-full border border-brand-border px-3.5 text-xs font-medium text-brand-text-secondary transition-colors hover:border-brand-text-secondary hover:text-brand-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary"
        >
          {addOpen ? "Close add place" : "Add place"}
        </button>
        <Link
          href={discoverHref}
          className="inline-flex min-h-[40px] items-center rounded-full border border-brand-border px-3.5 text-xs font-medium text-brand-text-secondary transition-colors hover:border-brand-text-secondary hover:text-brand-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary"
        >
          Open Discovery
        </Link>
      </div>

      {addOpen ? (
        <div className="mt-4 space-y-2">
          {availablePlaces.length === 0 ? (
            <p className="text-sm text-brand-text-secondary">
              Every selected Discovery place is already in this journey. Open
              Discovery to choose more, then return here to insert them.
            </p>
          ) : (
            availablePlaces.map((place) => (
              <button
                key={place.id}
                type="button"
                onClick={() => {
                  onAdd(place);
                  setAddOpen(false);
                }}
                className={`${surfaces.card} flex w-full flex-col p-3 text-left transition-colors hover:border-brand-text-secondary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary`}
              >
                <span className="text-[0.65rem] uppercase tracking-[0.16em] text-brand-text-secondary/80">
                  {place.category}
                </span>
                <span className="mt-1 font-display text-base text-brand-text-primary">
                  {place.title}
                </span>
                <span className="mt-1 line-clamp-2 text-xs text-brand-text-secondary">
                  {place.description}
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

function PlaceEditRow({
  place,
  index,
  total,
  dayNumber,
  allDayNumbers,
  onRemove,
  onToggleLock,
  onReorder,
  onMove,
}: {
  place: ComposedPlaceSlot;
  index: number;
  total: number;
  dayNumber: number;
  allDayNumbers: number[];
  onRemove: () => void;
  onToggleLock: () => void;
  onReorder: (direction: "up" | "down") => void;
  onMove: (toDay: number) => void;
}) {
  const otherDays = allDayNumbers.filter((n) => n !== dayNumber);

  return (
    <li className="flex flex-col gap-2 rounded-xl border border-brand-border/50 bg-brand-card px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium text-brand-text-primary">
            {place.title}
          </p>
          {place.locked ? (
            <span className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-brand-btn-primary">
              Locked
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <IconButton
          label="Move up"
          disabled={index === 0}
          onClick={() => onReorder("up")}
        >
          ↑
        </IconButton>
        <IconButton
          label="Move down"
          disabled={index >= total - 1}
          onClick={() => onReorder("down")}
        >
          ↓
        </IconButton>
        <IconButton
          label={place.locked ? "Unlock place" : "Lock place"}
          onClick={onToggleLock}
          active={place.locked}
        >
          {place.locked ? "Unlock" : "Lock"}
        </IconButton>
        <IconButton label="Remove place" onClick={onRemove}>
          Remove
        </IconButton>

        {otherDays.length > 0 ? (
          <label className="inline-flex items-center gap-1.5 text-xs text-brand-text-secondary">
            <span className="sr-only">Move to day</span>
            <select
              className="min-h-[32px] rounded-full border border-brand-border bg-transparent px-2 text-xs text-brand-text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary"
              defaultValue=""
              onChange={(e) => {
                const value = Number(e.target.value);
                if (!Number.isNaN(value) && value > 0) onMove(value);
                e.target.value = "";
              }}
              aria-label={`Move ${place.title} to another day`}
            >
              <option value="" disabled>
                Move to…
              </option>
              {otherDays.map((n) => (
                <option key={n} value={n}>
                  Day {n}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
    </li>
  );
}

import type { ReactNode } from "react";

function IconButton({
  label,
  onClick,
  disabled,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={[
        "inline-flex min-h-[32px] items-center rounded-full border px-2.5 text-[0.7rem] font-medium transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary",
        "disabled:cursor-not-allowed disabled:opacity-40",
        active
          ? "border-brand-btn-primary/40 bg-brand-btn-primary/10 text-brand-btn-primary"
          : "border-brand-border text-brand-text-secondary hover:border-brand-text-secondary hover:text-brand-text-primary",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function JourneyEditToolbar({
  dirty,
  saving,
  onSave,
  onCancel,
  onExitEdit,
}: {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
  onExitEdit: () => void;
}) {
  return (
    <div className="sticky top-14 z-20 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-border/50 bg-brand-bg/95 px-4 py-3 backdrop-blur-md lg:top-0">
      <p className="text-sm text-brand-text-secondary">
        {dirty ? "Unsaved changes" : "Edit mode — rearrange places, then save."}
      </p>
      <div className="flex flex-wrap gap-2">
        {dirty ? (
          <>
            <button
              type="button"
              disabled={saving}
              onClick={onCancel}
              className={buttonStyles.secondary}
            >
              Discard
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={onSave}
              className={buttonStyles.primary}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </>
        ) : (
          <button type="button" onClick={onExitEdit} className={buttonStyles.secondary}>
            Done editing
          </button>
        )}
      </div>
    </div>
  );
}
