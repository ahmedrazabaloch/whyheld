import {
  ComposedJourneySchema,
  type ComposedDay,
  type ComposedJourney,
  type ComposedPlaceSlot,
} from "@/lib/ai/schemas/composed-journey";

/**
 * Read a persisted composed itinerary from Journey.metadata.
 */
export function parseComposedJourney(raw: unknown): ComposedJourney | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const meta = raw as Record<string, unknown>;
  const composed = meta.composedJourney;
  if (!composed) return null;

  const parsed = ComposedJourneySchema.safeParse(composed);
  return parsed.success ? normalizeComposedJourney(parsed.data) : null;
}

/**
 * Ensure every day has a `places` array (migrate from placeTitles when needed)
 * and keep placeTitles in sync with places.
 */
export function normalizeComposedJourney(composed: ComposedJourney): ComposedJourney {
  return {
    ...composed,
    days: composed.days.map((day) => normalizeComposedDay(day)),
  };
}

export function normalizeComposedDay(day: ComposedDay): ComposedDay {
  let places: ComposedPlaceSlot[] = Array.isArray(day.places) ? [...day.places] : [];

  if (places.length === 0 && Array.isArray(day.placeTitles) && day.placeTitles.length > 0) {
    places = day.placeTitles.map((title, index) => ({
      id: `title:${slugify(title)}:${index}`,
      title,
      locked: false,
    }));
  }

  // Deduplicate by title while preserving order / lock
  const seen = new Set<string>();
  places = places.filter((p) => {
    const key = p.title.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const placeTitles = places.map((p) => p.title);

  return {
    ...day,
    places,
    placeTitles,
  };
}

export function syncPlaceTitles(day: ComposedDay): ComposedDay {
  const places = day.places ?? [];
  return {
    ...day,
    places,
    placeTitles: places.map((p) => p.title),
  };
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}
