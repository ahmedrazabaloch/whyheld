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
  buildDestinationIntroduction,
} from "@/components/discovery/discovery-data";
import { loadJourneyAccessInfo } from "@/lib/journey/load-access";
import { getCachedSession } from "@/lib/auth/session-cache";

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

  const destination = destinationDisplayName(journey.originQuery);
  const countryName =
    journey.primaryCountry?.trim() ||
    journey.originQuery?.split(",").map((p) => p.trim()).filter(Boolean).at(-1) ||
    destination;

  const composed = parseComposedJourney(journey.metadata, {
    fallbackCountry: countryName,
  });

  const displayDurationDays =
    composed && composed.days.length > 0
      ? composed.days.length
      : journey.durationDays;

  const normalizedDuration = formatJourneyDuration(
    displayDurationDays,
    journey.startDate,
    journey.endDate,
  );

  const normalizedDate = formatJourneyDate(journey.createdAt);

  const countryBlurb = buildDestinationIntroduction(countryName).culturalIdentity;

  const discovery = parseDiscoveryState(journey.metadata);
  const discoveryPlaces =
    discovery?.places.filter((p) => discovery.journeyPlaceIds.includes(p.id)) ??
    [];

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

  const initialEditMode = edit === "1" || edit === "true";

  const session = await getCachedSession();
  const accessInfo =
    composed && session?.user?.id
      ? await loadJourneyAccessInfo(journey.id, session.user.id)
      : null;

  return (
    <>
      <JourneyHero
        title={journey.title}
        duration={normalizedDuration}
        status={journey.status}
        createdDate={normalizedDate}
        country={countryName}
        countryBlurb={countryBlurb}
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
          discoveryPlaces={discoveryPlaces}
          destination={destination}
          journeyId={journey.id}
          initialEditMode={initialEditMode}
          accessInfo={accessInfo}
        />
      ) : (
        <JourneyTimeline stops={journey.stops || []} />
      )}
    </>
  );
}
