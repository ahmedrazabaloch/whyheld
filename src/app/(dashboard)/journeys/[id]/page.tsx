import { notFound } from "next/navigation";
import { loadJourney } from "@/actions/journey-actions";
import { JourneyHero } from "@/components/journey/JourneyHero";
import { JourneySummary } from "@/components/journey/JourneySummary";
import { JourneyTimeline } from "@/components/journey/JourneyTimeline";
import { ComposedJourneySections } from "@/components/journey/ComposedJourneySections";
import {
  formatJourneyDuration,
  formatJourneyDate,
  normalizeJourneySummary,
  normalizeJourneyMetadata,
} from "@/lib/utils/journey";
import { parseComposedJourney } from "@/lib/utils/composed-journey";
import {
  destinationDisplayName,
  parseDiscoveryState,
} from "@/components/discovery/discovery-data";
import { getWishlistKeysForJourney } from "@/actions/place-actions";

export default async function JourneyDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { id } = await params;
  const { edit } = await searchParams;

  const journey = await loadJourney(id);

  if (!journey) {
    notFound();
  }

  const rawMetadata =
    typeof journey.metadata === "object" && journey.metadata !== null
      ? (journey.metadata as Record<string, unknown>)
      : {};

  const normalizedDuration = formatJourneyDuration(
    journey.durationDays,
    journey.startDate,
    journey.endDate,
  );

  const normalizedDate = formatJourneyDate(journey.createdAt);

  const composed = parseComposedJourney(journey.metadata);
  const discovery = parseDiscoveryState(journey.metadata);
  const discoveryPlaces =
    discovery?.places.filter((p) => discovery.journeyPlaceIds.includes(p.id)) ??
    [];
  const savedPlaces = discoveryPlaces;

  const wishlistFromKeys = await getWishlistKeysForJourney(journey.id);
  const initialWishlistIds = Array.from(
    new Set([
      ...(discovery?.wishlistPlaceIds ?? []),
      ...wishlistFromKeys.discoveryPlaceIds,
    ]),
  );

  const normalizedSummary = normalizeJourneySummary(
    journey.summary,
    typeof rawMetadata.aiSummary === "string" ? rawMetadata.aiSummary : null,
  );

  const normalizedMetadata = normalizeJourneyMetadata({
    originQuery: journey.originQuery,
    primaryCountry: journey.primaryCountry,
    region: journey.region,
    pace: journey.pace,
    budget: journey.budget,
  });

  const destination = destinationDisplayName(journey.originQuery);
  const initialEditMode = edit === "1" || edit === "true";

  return (
    <>
      <JourneyHero
        title={journey.title}
        duration={normalizedDuration}
        status={journey.status}
        createdDate={normalizedDate}
      />

      <JourneySummary
        summary={normalizedSummary}
        destination={normalizedMetadata.destination}
        pace={normalizedMetadata.pace}
        budget={normalizedMetadata.budget}
        heading={composed ? "Overview" : "Journey Summary"}
      />

      {composed ? (
        <ComposedJourneySections
          composed={composed}
          savedPlaces={savedPlaces}
          discoveryPlaces={discoveryPlaces}
          destination={destination}
          journeyId={journey.id}
          initialWishlistIds={initialWishlistIds}
          initialEditMode={initialEditMode}
        />
      ) : (
        <JourneyTimeline stops={journey.stops || []} />
      )}
    </>
  );
}
