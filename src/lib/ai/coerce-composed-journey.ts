/**
 * Normalize slightly off-schema AI JSON into ComposedJourney shape.
 * Models often emit `day` instead of `dayNumber`, and omit title/summary.
 */

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

export function coerceComposedDayAiOutput(
  raw: unknown,
  fallbackDayNumber = 1,
  fallbackCountry?: string,
): unknown {
  const day = asRecord(raw);
  if (!day) return raw;

  const next = { ...day };

  if (next.dayNumber == null && next.day != null) {
    const n = typeof next.day === "number" ? next.day : Number(next.day);
    if (!Number.isNaN(n)) next.dayNumber = n;
  }
  if (next.dayNumber == null) {
    next.dayNumber = fallbackDayNumber;
  }

  // Alternate keys
  if (typeof next.city !== "string" && typeof next.area === "string") {
    next.city = next.area;
  }
  if (typeof next.country !== "string" && typeof next.destination === "string") {
    next.country = next.destination;
  }
  if (!next.country && fallbackCountry) next.country = fallbackCountry;

  if (typeof next.summary !== "string" || !next.summary.trim()) {
    if (typeof next.daySummary === "string" && next.daySummary.trim()) {
      next.summary = next.daySummary;
    }
  }

  next.details = asStringList(next.details).length
    ? asStringList(next.details)
    : asStringList(next.tips).length
      ? asStringList(next.tips)
      : asStringList(next.highlights);

  if (typeof next.localTips !== "string") {
    if (typeof next.localTip === "string") next.localTips = next.localTip;
  }
  if (typeof next.weatherNote !== "string") {
    if (typeof next.weather === "string") next.weatherNote = next.weather;
  }

  if (next.estimatedDriveHours != null) {
    const n = Number(next.estimatedDriveHours);
    if (!Number.isNaN(n)) next.estimatedDriveHours = n;
    else delete next.estimatedDriveHours;
  }

  // Prefer a single summary; keep MAE for legacy schema fill
  const summary =
    typeof next.summary === "string" && next.summary.trim()
      ? next.summary.trim()
      : "";

  for (const key of ["transition", "pacing", "morning", "afternoon", "evening"] as const) {
    if (typeof next[key] !== "string") next[key] = "";
  }

  if (summary) {
    next.summary = summary;
    // If MAE empty, put summary in morning so older readers still have text
    if (!next.morning && !next.afternoon && !next.evening) {
      next.morning = summary;
    }
  } else {
    const joined = [next.morning, next.afternoon, next.evening]
      .filter((part) => typeof part === "string" && part.trim())
      .join("\n\n");
    if (joined) next.summary = joined;
  }

  if (!Array.isArray(next.placeTitles)) next.placeTitles = [];
  if (!Array.isArray(next.places)) next.places = [];

  // Drop useless system/meta notes from AI
  if (typeof next.notes === "string") {
    const n = next.notes.toLowerCase();
    if (
      n.includes("no locked places") ||
      n.includes("written intentionally") ||
      n.includes("has been written") ||
      n.includes("intentionally as a settling")
    ) {
      delete next.notes;
    }
  }

  return next;
}

export function coerceComposedJourneyAiOutput(
  raw: unknown,
  fallbackDestination?: string,
): unknown {
  const root = asRecord(raw);
  if (!root) return raw;

  const next = { ...root };
  const destination =
    (typeof next.destination === "string" && next.destination.trim()) ||
    fallbackDestination?.trim() ||
    "";

  if (typeof next.title !== "string" || !next.title.trim()) {
    next.title = destination
      ? `A journey through ${destination}`
      : "Your Wayheld journey";
  }

  const daysRaw = Array.isArray(next.days) ? next.days : [];
  next.days = daysRaw.map((day, index) =>
    coerceComposedDayAiOutput(day, index + 1, destination),
  );

  if (typeof next.summary !== "string" || !next.summary.trim()) {
    const first = asRecord(daysRaw[0]);
    const daySummary =
      first && typeof first.summary === "string" ? first.summary.trim() : "";
    const transition =
      first && typeof first.transition === "string" ? first.transition.trim() : "";
    next.summary =
      daySummary ||
      transition ||
      "A calm, unhurried itinerary shaped from the places you chose.";
  }

  return next;
}
