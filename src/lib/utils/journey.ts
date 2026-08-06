/**
 * Journey formatting and normalization utilities.
 * Pure functions. No side effects. No database queries.
 */

export function formatJourneyDuration(
  durationDays?: number | null, 
  startDate?: Date | string | null, 
  endDate?: Date | string | null
): string {
  if (durationDays && durationDays > 0) {
    return `${durationDays} ${durationDays === 1 ? 'day' : 'days'}`;
  }
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive duration
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
    }
  }

  return "Duration flexible";
}

export function formatJourneyDate(date?: Date | string | null): string {
  if (!date) return "Unknown date";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Unknown date";
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(d);
}

export function normalizeJourneySummary(summary?: string | null, aiSummary?: string | null): string {
  if (summary && summary.trim().length > 0) return summary;
  if (aiSummary && aiSummary.trim().length > 0) return aiSummary;
  return "No summary available";
}

/**
 * How many distinct places a journey actually holds.
 *
 * JourneyStop rows are narrative segments (morning / afternoon / evening), so
 * counting them reports the wrong number. Read the composed itinerary instead,
 * falling back to the Discovery board for journeys that were never composed.
 */
export function countJourneyPlaces(metadata: unknown): number {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return 0;
  }
  const meta = metadata as Record<string, unknown>;

  const composed = meta.composedJourney as { days?: unknown } | undefined;
  if (composed && Array.isArray(composed.days)) {
    const titles = new Set<string>();
    for (const rawDay of composed.days) {
      if (!rawDay || typeof rawDay !== "object") continue;
      const day = rawDay as { places?: unknown; placeTitles?: unknown };

      if (Array.isArray(day.places)) {
        for (const place of day.places) {
          const title = (place as { title?: unknown })?.title;
          if (typeof title === "string" && title.trim()) {
            titles.add(title.trim().toLowerCase());
          }
        }
      } else if (Array.isArray(day.placeTitles)) {
        for (const title of day.placeTitles) {
          if (typeof title === "string" && title.trim()) {
            titles.add(title.trim().toLowerCase());
          }
        }
      }
    }
    return titles.size;
  }

  const discovery = meta.discovery as { journeyPlaceIds?: unknown } | undefined;
  if (discovery && Array.isArray(discovery.journeyPlaceIds)) {
    return discovery.journeyPlaceIds.filter((id) => typeof id === "string").length;
  }

  return 0;
}

export function normalizeJourneyMetadata(metadata: {
  originQuery?: string | null;
  primaryCountry?: string | null;
  region?: string | null;
  pace?: string | null;
}) {
  const destination = metadata.originQuery || metadata.region || metadata.primaryCountry || "Unknown";
  
  let pace = "Flexible";
  switch (metadata.pace) {
    case "ONE_PLACE_DEEPLY": pace = "One place deeply"; break;
    case "SLOW_UNHURRIED": pace = "Slow & unhurried"; break;
    case "GENTLY_BALANCED": pace = "Gently balanced"; break;
  }

  return {
    destination,
    pace,
  };
}
