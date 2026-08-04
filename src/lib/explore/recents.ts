/**
 * Explore destination chips — trending presets + recent localStorage.
 */

export const TRENDING_DESTINATIONS = [
  "Kyoto",
  "Tuscany",
  "Iceland",
  "Bali",
  "Morocco",
] as const;

const RECENT_KEY = "wayheld:explore-recent";
const RECENT_MAX = 6;

export function readRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, RECENT_MAX);
  } catch {
    return [];
  }
}

export function pushRecentSearch(destination: string): string[] {
  const next = destination.trim();
  if (!next) return readRecentSearches();

  const prev = readRecentSearches().filter(
    (item) => item.toLowerCase() !== next.toLowerCase(),
  );
  const updated = [next, ...prev].slice(0, RECENT_MAX);

  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {
    // ignore quota / private mode
  }
  return updated;
}
