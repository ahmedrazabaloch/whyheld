/**
 * Discovery place types and destination copy helpers.
 * Place cards are filled by AI via /api/v1/journeys/[id]/discover.
 * Selections + generated places persist on Journey.metadata.discovery.
 */

export type DiscoveryPlace = {
  id: string;
  category: string;
  title: string;
  description: string;
  highlights: string[];
};

export type DestinationIntroduction = {
  culturalIdentity: string;
  heritage: string;
  atmosphere: string;
  whatMakesItSpecial: string;
};

/** Persisted under Journey.metadata.discovery */
export type DiscoveryDraftState = {
  places: DiscoveryPlace[];
  journeyPlaceIds: string[];
  wishlistPlaceIds: string[];
};

export type JourneyMetadata = {
  lastCompletedStep?: number;
  discovery?: DiscoveryDraftState;
  [key: string]: unknown;
};

export function destinationDisplayName(originQuery: string | null | undefined): string {
  if (!originQuery?.trim()) return "Your destination";
  return originQuery.split(",")[0]?.trim() || originQuery.trim();
}

export function buildDestinationIntroduction(
  destination: string,
): DestinationIntroduction {
  return {
    culturalIdentity: `${destination} carries a quiet confidence — a place shaped by daily ritual as much as by grand landmarks.`,
    heritage:
      "Layers of history sit close to the surface: crafts, courtyards, and stories that still guide how people move through the day.",
    atmosphere:
      "Mornings feel unhurried. Afternoons open into markets, shade, and conversation. Evenings settle into a softer light.",
    whatMakesItSpecial: `What sets ${destination} apart is not a single sight, but the way time stretches when you stay long enough to notice.`,
  };
}

export function parseJourneyMetadata(raw: unknown): JourneyMetadata {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as JourneyMetadata;
}

export function parseDiscoveryState(raw: unknown): DiscoveryDraftState | null {
  const meta = parseJourneyMetadata(raw);
  const discovery = meta.discovery;
  if (!discovery || typeof discovery !== "object") return null;

  const places = Array.isArray(discovery.places)
    ? discovery.places.filter(
        (p): p is DiscoveryPlace =>
          !!p &&
          typeof p === "object" &&
          typeof (p as DiscoveryPlace).id === "string" &&
          typeof (p as DiscoveryPlace).title === "string" &&
          typeof (p as DiscoveryPlace).category === "string" &&
          typeof (p as DiscoveryPlace).description === "string" &&
          Array.isArray((p as DiscoveryPlace).highlights),
      )
    : [];

  const journeyPlaceIds = Array.isArray(discovery.journeyPlaceIds)
    ? discovery.journeyPlaceIds.filter((id): id is string => typeof id === "string")
    : [];

  const wishlistPlaceIds = Array.isArray(discovery.wishlistPlaceIds)
    ? discovery.wishlistPlaceIds.filter((id): id is string => typeof id === "string")
    : [];

  return { places, journeyPlaceIds, wishlistPlaceIds };
}
