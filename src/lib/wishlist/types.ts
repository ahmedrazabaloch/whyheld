/**
 * Wishlist helpers — reuse SavedPlace rows; metadata carries source context.
 */

export type WishlistSource = "discovery" | "journey";

export type WishlistPlaceMetadata = {
  source: WishlistSource;
  category: string;
  destination: string;
  journeyId: string | null;
  discoveryPlaceId?: string;
  wishlistKey: string;
};

export type WishlistItemView = {
  id: string;
  title: string;
  category: string;
  destination: string;
  description: string;
  dateAdded: string;
  createdAt: string;
  source: WishlistSource;
  journeyId: string | null;
  /** Original Discovery place id when saved from Discovery. */
  discoveryPlaceId: string | null;
};

export function discoveryWishlistKey(journeyId: string, placeId: string) {
  return `discovery:${journeyId}:${placeId}`;
}

export function journeyWishlistKey(
  journeyId: string,
  name: string,
  googlePlaceId?: string | null,
) {
  if (googlePlaceId) return `google:${googlePlaceId}`;
  const slug = name.trim().toLowerCase().replace(/\s+/g, "-").slice(0, 80);
  return `journey:${journeyId}:${slug}`;
}

export function parseWishlistMetadata(raw: unknown): WishlistPlaceMetadata | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const m = raw as Record<string, unknown>;
  if (typeof m.wishlistKey !== "string") return null;
  const source = m.source === "discovery" || m.source === "journey" ? m.source : "journey";
  return {
    source,
    category: typeof m.category === "string" ? m.category : "Place",
    destination: typeof m.destination === "string" ? m.destination : "Unknown",
    journeyId: typeof m.journeyId === "string" ? m.journeyId : null,
    discoveryPlaceId:
      typeof m.discoveryPlaceId === "string" ? m.discoveryPlaceId : undefined,
    wishlistKey: m.wishlistKey,
  };
}

export function formatWishlistDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}
