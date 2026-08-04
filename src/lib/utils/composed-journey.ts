import {
  ComposedJourneySchema,
  type ComposedDay,
  type ComposedJourney,
  type ComposedPlaceSlot,
} from "@/lib/ai/schemas/composed-journey";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

/** Soft infer: "Fifteen Days in AlUla: …" → AlUla */
function inferCityFromJourneyTitle(
  title: string | undefined,
  countryHint?: string,
): string | undefined {
  if (!title?.trim()) return undefined;
  const match = title.match(
    /\b(?:in|through|around|across)\s+([A-Z][\w'’.-]*(?:\s+[A-Z][\w'’.-]*){0,2})\b/,
  );
  const city = match?.[1]?.trim();
  if (!city) return undefined;
  const lower = city.toLowerCase();
  const blocked = [
    "saudi arabia",
    "united arab emirates",
    "the uae",
    "your journey",
    "this journey",
  ];
  if (blocked.some((b) => lower === b || lower.includes(b))) return undefined;
  if (countryHint && lower === countryHint.trim().toLowerCase()) return undefined;
  return city;
}

/**
 * Read a persisted composed itinerary from Journey.metadata.
 */
export function parseComposedJourney(
  raw: unknown,
  options?: { fallbackCountry?: string },
): ComposedJourney | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const meta = raw as Record<string, unknown>;
  const composed = meta.composedJourney;
  if (!composed) return null;

  const parsed = ComposedJourneySchema.safeParse(composed);
  return parsed.success
    ? normalizeComposedJourney(parsed.data, options)
    : null;
}

/**
 * Ensure every day has a `places` array (migrate from placeTitles when needed)
 * and keep placeTitles in sync with places.
 */
export function normalizeComposedJourney(
  composed: ComposedJourney,
  options?: { fallbackCountry?: string },
): ComposedJourney {
  const inferredCity = inferCityFromJourneyTitle(
    composed.title,
    options?.fallbackCountry,
  );
  return {
    ...composed,
    notes: isMeaningfulTravelerNote(composed.notes) ? composed.notes : undefined,
    days: composed.days.map((day) =>
      normalizeComposedDay(day, options?.fallbackCountry, inferredCity),
    ),
  };
}

export function normalizeComposedDay(
  day: ComposedDay,
  fallbackCountry?: string,
  fallbackCity?: string,
): ComposedDay {
  let places: ComposedPlaceSlot[] = Array.isArray(day.places) ? [...day.places] : [];

  if (places.length === 0 && Array.isArray(day.placeTitles) && day.placeTitles.length > 0) {
    places = day.placeTitles.map((title, index) => ({
      id: `title:${slugify(title)}:${index}`,
      title,
      locked: false,
      city: day.city,
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
  const summary = dayNarrativeSummary({ ...day, places, placeTitles });
  const details = Array.isArray(day.details)
    ? day.details.map((d) => d.trim()).filter(Boolean)
    : [];

  const cityFromPlaces = places.map((p) => p.city?.trim()).find(Boolean);
  const city =
    day.city?.trim() ||
    cityFromPlaces ||
    fallbackCity?.trim() ||
    undefined;
  const country =
    day.country?.trim() ||
    fallbackCountry?.trim() ||
    undefined;

  const notes = isMeaningfulTravelerNote(day.notes) ? day.notes : undefined;
  const localTips = isMeaningfulTravelerNote(day.localTips)
    ? day.localTips
    : undefined;
  const weatherNote = isMeaningfulTravelerNote(day.weatherNote)
    ? day.weatherNote
    : undefined;

  const driveHours =
    typeof day.estimatedDriveHours === "number" &&
    !Number.isNaN(day.estimatedDriveHours)
      ? day.estimatedDriveHours
      : undefined;

  const tooManyPlaces = places.length > 3;
  const longDrive = driveHours != null && driveHours > 2.5;

  return {
    ...day,
    city,
    country,
    summary: summary || day.summary,
    details,
    notes,
    localTips,
    weatherNote,
    estimatedDriveHours: driveHours,
    ethosFlags: {
      tooManyPlaces: tooManyPlaces || day.ethosFlags?.tooManyPlaces,
      longDrive: longDrive || day.ethosFlags?.longDrive,
    },
    places,
    placeTitles,
  };
}

/** Single readable day narrative (prefers summary over morning/afternoon/evening). */
export function dayNarrativeSummary(day: ComposedDay): string {
  if (day.summary?.trim()) return day.summary.trim();
  return [day.morning, day.afternoon, day.evening]
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean)
    .join("\n\n");
}

/** Tip lines for the day (without a leading dash — UI adds it). */
export function dayDetailBullets(day: ComposedDay): string[] {
  if (!Array.isArray(day.details)) return [];
  return day.details
    .map((line) => line.replace(/^\s*[-•]\s*/, "").trim())
    .filter(Boolean);
}

/**
 * Hide system/meta notes that are useless to travellers
 * (e.g. "No locked places were assigned…").
 */
export function isMeaningfulTravelerNote(note: string | undefined | null): boolean {
  if (!note?.trim()) return false;
  const n = note.toLowerCase();
  const rejected = [
    "no locked places",
    "locked places were assigned",
    "written intentionally",
    "has been written",
    "no places assigned",
    "regenerate this day",
    "add one below",
  ];
  return !rejected.some((phrase) => n.includes(phrase));
}

export function syncPlaceTitles(day: ComposedDay): ComposedDay {
  const places = day.places ?? [];
  return {
    ...day,
    places,
    placeTitles: places.map((p) => p.title),
  };
}
