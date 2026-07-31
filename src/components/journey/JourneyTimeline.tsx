"use client";

import { useState, useMemo } from "react";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { JourneyStopCard } from "./JourneyStopCard";
import type { JourneyStop } from "@prisma/client";

export interface JourneyTimelineProps {
  stops: JourneyStop[];
}

interface InterestFilter {
  id: string;
  label: string;
  kinds?: string[];
}

const INTEREST_FILTERS: InterestFilter[] = [
  { id: "ALL", label: "✨ All Interests" },
  { id: "HERITAGE", label: "🏛️ Heritage & Culture", kinds: ["HERITAGE_SITE", "CITY"] },
  { id: "NATURE", label: "🌿 Nature & Outdoors", kinds: ["NATURE", "VILLAGE"] },
  { id: "EXPERIENCE", label: "🎭 Experiences & Stays", kinds: ["EXPERIENCE", "STAY"] },
  { id: "MEAL", label: "🍽️ Food & Dining", kinds: ["MEAL"] },
  { id: "TRANSIT", label: "⛵ Transit & Towns", kinds: ["TRANSIT", "TOWN"] },
];

export function JourneyTimeline({ stops }: JourneyTimelineProps) {
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  // Group stops by Day
  const groupedDays = useMemo(() => {
    const daysMap = new Map<number, { dayNumber: number; theme?: string; summary?: string; stops: JourneyStop[] }>();

    for (const stop of stops) {
      const meta = (typeof stop.metadata === "object" && stop.metadata !== null)
        ? (stop.metadata as Record<string, any>)
        : {};

      const dayNumber = stop.dayStart || meta.dayNumber || stop.order || 1;
      const dayTheme = meta.dayTheme;
      const daySummary = meta.daySummary;

      if (!daysMap.has(dayNumber)) {
        daysMap.set(dayNumber, {
          dayNumber,
          theme: dayTheme,
          summary: daySummary,
          stops: [],
        });
      }

      daysMap.get(dayNumber)!.stops.push(stop);
    }

    return Array.from(daysMap.values()).sort((a, b) => a.dayNumber - b.dayNumber);
  }, [stops]);

  // Filter stops based on selected interest
  const filteredDays = useMemo(() => {
    if (activeFilter === "ALL") return groupedDays;

    const targetKinds = INTEREST_FILTERS.find((f) => f.id === activeFilter)?.kinds;
    if (!targetKinds || targetKinds.length === 0) return groupedDays;

    return groupedDays
      .map((day) => ({
        ...day,
        stops: day.stops.filter((s) => targetKinds.includes(s.kind)),
      }))
      .filter((day) => day.stops.length > 0);
  }, [groupedDays, activeFilter]);

  if (!stops || stops.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        }
        title="No stops available"
        description="This journey was generated without specific stops, or generation is still pending."
      />
    );
  }

  return (
    <div className="w-full space-y-8 mt-8">
      {/* Filter by interest header */}
      <div className="rounded-3xl p-6 bg-brand-card border border-brand-border/60 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-display text-lg text-brand-text-primary font-normal">
              Filter by Interest
            </h3>
            <p className="text-xs text-brand-text-secondary mt-0.5 font-light">
              Select an interest category to highlight specific stops along your route.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {INTEREST_FILTERS.map((filter) => {
            const isSelected = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-brand-btn-primary text-brand-bg shadow-sm scale-[1.02]"
                    : "bg-brand-bg/80 text-brand-text-primary hover:bg-brand-border/40 border border-brand-border/50"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Days */}
      {filteredDays.length === 0 ? (
        <div className="text-center py-12 text-sm text-brand-text-secondary bg-brand-card/40 rounded-3xl border border-brand-border/40">
          No stops match the selected interest filter. Select "All Interests" to view your complete itinerary.
        </div>
      ) : (
        <div className="space-y-10">
          {filteredDays.map((day) => (
            <div key={day.dayNumber} className="relative">
              {/* Day Header Banner */}
              <div className="mb-4 pl-2">
                <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full bg-brand-border/40 text-brand-text-secondary/90 border border-brand-border/60">
                    Day {day.dayNumber}
                  </span>
                  {day.theme && (
                    <h3 className="font-display text-xl font-normal text-brand-text-primary">
                      • {day.theme}
                    </h3>
                  )}
                </div>
                {day.summary && (
                  <p className="text-sm text-brand-text-secondary font-light leading-relaxed max-w-3xl">
                    {day.summary}
                  </p>
                )}
              </div>

              {/* Day Stops */}
              <div className="space-y-4">
                {day.stops.map((stop, idx) => (
                  <JourneyStopCard
                    key={stop.id}
                    stopId={stop.id}
                    order={idx + 1}
                    name={stop.name}
                    kind={stop.kind}
                    description={stop.description || ""}
                    highlights={stop.highlights || []}
                    metadata={stop.metadata}
                    googlePlaceId={stop.googlePlaceId || undefined}
                    latitude={stop.latitude || undefined}
                    longitude={stop.longitude || undefined}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
