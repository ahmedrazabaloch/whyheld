"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { LocationAutocomplete } from "@/components/location/LocationAutocomplete";
import type { useJourneyBuilder } from "@/hooks/useJourneyBuilder";
import type { TripPoint } from "@/lib/journey/trip-shape";

const MAX_MUST_VISIT = 5;

async function resolvePoint(
  placeId: string,
  name: string,
): Promise<TripPoint> {
  if (!placeId) return { name };
  try {
    const res = await fetch(
      `/api/v1/maps/details?placeId=${encodeURIComponent(placeId)}`,
    );
    if (!res.ok) return { name, placeId };
    const data = (await res.json()) as {
      location?: {
        latitude?: number | null;
        longitude?: number | null;
        placeId?: string | null;
      };
    };
    return {
      name,
      placeId: data.location?.placeId || placeId,
      lat: data.location?.latitude ?? undefined,
      lng: data.location?.longitude ?? undefined,
    };
  } catch {
    return { name, placeId };
  }
}

export function StepAlongTheWay({
  controller,
}: {
  controller: ReturnType<typeof useJourneyBuilder>;
}) {
  const { data, update } = controller;
  const tripShape = data.tripShape ?? { mustVisit: [] };
  const mustVisit = tripShape.mustVisit ?? [];
  const [mustVisitKey, setMustVisitKey] = useState(0);

  const setShape = (next: typeof tripShape) => {
    update("tripShape", next);
  };

  return (
    <section
      id="setup-along-the-way"
      className="space-y-8"
      aria-labelledby="setup-along-title"
    >
      <div className="space-y-2">
        <h2
          id="setup-along-title"
          className="font-display text-2xl font-light tracking-tight text-brand-text-primary sm:text-[1.75rem]"
        >
          Along the way
        </h2>
        <p className="max-w-lg text-sm leading-relaxed text-brand-text-secondary">
          Optionally name a starting point, an ending point, and up to five
          places you already know you want to visit.
        </p>
      </div>

      <div className="space-y-5">
        <LocationAutocomplete
          label="Starting point"
          placeholder="Where does the journey begin?"
          value={tripShape.startPoint?.name || ""}
          showDetectButton={false}
          onChange={async (placeId, description) => {
            const point = await resolvePoint(placeId, description);
            setShape({ ...tripShape, startPoint: point });
          }}
        />

        <LocationAutocomplete
          label="Ending point"
          placeholder="Where does it settle?"
          value={tripShape.endPoint?.name || ""}
          showDetectButton={false}
          onChange={async (placeId, description) => {
            const point = await resolvePoint(placeId, description);
            setShape({ ...tripShape, endPoint: point });
          }}
        />
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-brand-text-primary">
            Must-visit places
          </h3>
          <p className="mt-1 text-xs text-brand-text-secondary">
            {mustVisit.length} of {MAX_MUST_VISIT} chosen. These are preferred
            when Discovery and the itinerary are composed.
          </p>
        </div>

        {mustVisit.length > 0 ? (
          <ul className="space-y-2">
            {mustVisit.map((place, index) => (
              <li
                key={`${place.name}-${index}`}
                className="flex items-center justify-between gap-3 rounded-full border border-brand-border/60 bg-brand-bg/70 px-4 py-2.5"
              >
                <span className="truncate text-sm font-medium text-brand-text-primary">
                  {place.name}
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${place.name}`}
                  onClick={() => {
                    setShape({
                      ...tripShape,
                      mustVisit: mustVisit.filter((_, i) => i !== index),
                    });
                  }}
                  className="rounded-full p-1 text-brand-text-secondary transition-colors hover:text-brand-text-primary"
                >
                  <X className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {mustVisit.length < MAX_MUST_VISIT ? (
          <LocationAutocomplete
            key={mustVisitKey}
            label="Add a place"
            placeholder="Search a place you want to include"
            value=""
            showDetectButton={false}
            onChange={async (placeId, description) => {
              if (!description.trim()) return;
              if (
                mustVisit.some(
                  (p) =>
                    p.name.trim().toLowerCase() ===
                    description.trim().toLowerCase(),
                )
              ) {
                return;
              }
              const point = await resolvePoint(placeId, description);
              setShape({
                ...tripShape,
                mustVisit: [...mustVisit, point].slice(0, MAX_MUST_VISIT),
              });
              setMustVisitKey((k) => k + 1);
            }}
          />
        ) : null}
      </div>
    </section>
  );
}
