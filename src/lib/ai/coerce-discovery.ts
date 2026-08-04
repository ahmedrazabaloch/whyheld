/**
 * Normalize slightly off-schema Discovery AI JSON.
 * Models often return a bare places array instead of `{ places: [...] }`.
 */

function normalizePlace(place: unknown): unknown {
  if (!place || typeof place !== "object" || Array.isArray(place)) return place;

  // Trim keys in case the model emitted "weatherNote " etc.
  const raw = place as Record<string, unknown>;
  const p: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    p[key.trim()] = value;
  }

  if (!Array.isArray(p.highlights)) {
    p.highlights = [];
  }

  // Accept alternate keys from models
  if (typeof p.localTips !== "string") {
    if (typeof p.localTip === "string") p.localTips = p.localTip;
    else if (typeof p.tips === "string") p.localTips = p.tips;
  }
  if (typeof p.guideNote !== "string") {
    if (typeof p.guideNotes === "string") p.guideNote = p.guideNotes;
    else if (typeof p.curatorNote === "string") p.guideNote = p.curatorNote;
  }
  if (typeof p.weatherNote !== "string") {
    if (typeof p.weather === "string") p.weatherNote = p.weather;
    else if (typeof p.seasonalNote === "string") p.weatherNote = p.seasonalNote;
  }

  if (typeof p.localTips === "string" && !p.localTips.trim()) delete p.localTips;
  if (typeof p.guideNote === "string" && !p.guideNote.trim()) delete p.guideNote;
  if (typeof p.weatherNote === "string" && !p.weatherNote.trim()) delete p.weatherNote;

  return p;
}

export function coerceDiscoveryPlacesAiOutput(raw: unknown): unknown {
  let places: unknown[] | null = null;

  if (Array.isArray(raw)) {
    places = raw;
  } else if (raw && typeof raw === "object") {
    const root = raw as Record<string, unknown>;
    if (Array.isArray(root.places)) places = root.places;
    else if (Array.isArray(root.items)) places = root.items;
    else if (Array.isArray(root.discoveries)) places = root.discoveries;
  }

  if (!places) return raw;

  return {
    places: places.map(normalizePlace),
  };
}
