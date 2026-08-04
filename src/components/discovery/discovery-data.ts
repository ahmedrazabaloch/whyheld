/**
 * Discovery place types and destination copy helpers.
 * Place cards are filled by AI via /api/v1/journeys/[id]/discover.
 * Selections + generated places persist on Journey.metadata.discovery.
 */

export type DiscoveryBoardStatus = "PENDING" | "COMPLETE";

export type DiscoveryPlace = {
  id: string;
  category: string;
  title: string;
  description: string;
  highlights: string[];
  localTips?: string;
  guideNote?: string;
  weatherNote?: string;
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
  /** Whole journey-card status on Discovery. */
  boardStatus?: DiscoveryBoardStatus;
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

function parsePlace(p: unknown): DiscoveryPlace | null {
  if (!p || typeof p !== "object") return null;
  const place = p as Record<string, unknown>;
  if (
    typeof place.id !== "string" ||
    typeof place.title !== "string" ||
    typeof place.category !== "string" ||
    typeof place.description !== "string" ||
    !Array.isArray(place.highlights)
  ) {
    return null;
  }

  return {
    id: place.id,
    category: place.category,
    title: place.title,
    description: place.description,
    highlights: place.highlights.filter((h): h is string => typeof h === "string"),
    localTips: typeof place.localTips === "string" ? place.localTips : undefined,
    guideNote: typeof place.guideNote === "string" ? place.guideNote : undefined,
    weatherNote: typeof place.weatherNote === "string" ? place.weatherNote : undefined,
  };
}

export function parseDiscoveryState(raw: unknown): DiscoveryDraftState | null {
  const meta = parseJourneyMetadata(raw);
  const discovery = meta.discovery;
  if (!discovery || typeof discovery !== "object") return null;

  const places = Array.isArray(discovery.places)
    ? discovery.places.map(parsePlace).filter((p): p is DiscoveryPlace => !!p)
    : [];

  const journeyPlaceIds = Array.isArray(discovery.journeyPlaceIds)
    ? discovery.journeyPlaceIds.filter((id): id is string => typeof id === "string")
    : [];

  const wishlistPlaceIds = Array.isArray(discovery.wishlistPlaceIds)
    ? discovery.wishlistPlaceIds.filter((id): id is string => typeof id === "string")
    : [];

  const boardStatus =
    discovery.boardStatus === "COMPLETE" || discovery.boardStatus === "PENDING"
      ? discovery.boardStatus
      : "PENDING";

  return { places, journeyPlaceIds, wishlistPlaceIds, boardStatus };
}

export function paceLabel(pace: string | null | undefined): string {
  switch (pace) {
    case "ONE_PLACE_DEEPLY":
      return "One place, deeply";
    case "SLOW_UNHURRIED":
      return "Slow & unhurried";
    case "GENTLY_BALANCED":
      return "Gently balanced";
    default:
      return "—";
  }
}

export function budgetLabel(budget: string | null | undefined): string {
  switch (budget) {
    case "MODEST":
      return "Modest";
    case "COMFORTABLE":
      return "Comfortable";
    case "PREMIUM":
      return "Premium";
    case "LUXURY":
      return "Luxury";
    default:
      return "—";
  }
}
