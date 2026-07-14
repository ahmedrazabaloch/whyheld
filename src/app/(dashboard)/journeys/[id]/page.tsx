import { notFound } from "next/navigation";
import { loadJourney } from "@/actions/journey-actions";
import { JourneyHero } from "@/components/journey/JourneyHero";
import { JourneySummary } from "@/components/journey/JourneySummary";
import { JourneyTimeline } from "@/components/journey/JourneyTimeline";
import {
  formatJourneyDuration,
  formatJourneyDate,
  normalizeJourneySummary,
  normalizeJourneyMetadata,
} from "@/lib/utils/journey";

export default async function JourneyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // 1. Load journey
  const journey = await loadJourney(id);
  
  // 2. Return 404 when journey == null
  if (!journey) {
    notFound();
  }

  // 3. Normalize data using helpers
  const rawMetadata = (typeof journey.metadata === 'object' && journey.metadata !== null) 
    ? (journey.metadata as Record<string, any>) 
    : {};

  const normalizedDuration = formatJourneyDuration(
    journey.durationDays,
    journey.startDate,
    journey.endDate
  );
  
  const normalizedDate = formatJourneyDate(journey.createdAt);
  
  const normalizedSummary = normalizeJourneySummary(
    journey.summary,
    rawMetadata.aiSummary
  );

  const normalizedMetadata = normalizeJourneyMetadata({
    originQuery: journey.originQuery,
    primaryCountry: journey.primaryCountry,
    region: journey.region,
    pace: journey.pace,
    budget: journey.budget,
  });

  // 4. Pass formatted props to components
  // 5. Compose the page
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
      />

      <JourneyTimeline stops={journey.stops || []} />
    </>
  );
}
