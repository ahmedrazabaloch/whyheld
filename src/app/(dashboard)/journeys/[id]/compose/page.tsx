import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { loadJourney } from "@/actions/journey-actions";
import { JourneyComposeView } from "@/components/journey/JourneyComposeView";
import { parseComposedJourney } from "@/lib/utils/composed-journey";
import {
  destinationDisplayName,
  parseDiscoveryState,
  parseJourneyMetadata,
} from "@/components/discovery/discovery-data";
import { getCachedProfile, getCachedSession } from "@/lib/auth/session-cache";

export const metadata: Metadata = {
  title: "Preparing your journey — Wayheld",
  description: "Arranging your days carefully from the places you chose.",
};

export default async function JourneyComposePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [journey, session] = await Promise.all([loadJourney(id), getCachedSession()]);

  if (!journey) {
    notFound();
  }

  const composed = parseComposedJourney(journey.metadata);
  const hasStops = (journey.stops?.length ?? 0) > 0;

  // Already generated — open the existing journey
  if (journey.status === "READY" && (composed || hasStops)) {
    redirect(`/journeys/${id}`);
  }

  const profile = session?.user?.id
    ? await getCachedProfile(session.user.id)
    : null;

  const meta = parseJourneyMetadata(journey.metadata);
  const feelingIds = Array.isArray(meta.feelings)
    ? meta.feelings.filter((f): f is string => typeof f === "string" && f.length > 0)
    : [];

  const discovery = parseDiscoveryState(journey.metadata);
  const selectedPlaces =
    discovery?.places.filter((p) => discovery.journeyPlaceIds.includes(p.id)) ??
    [];

  const destination = destinationDisplayName(
    journey.originQuery || journey.primaryCountry || journey.title,
  );

  return (
    <JourneyComposeView
      journeyId={journey.id}
      destination={destination}
      firstName={profile?.firstName?.trim() || null}
      feelingIds={feelingIds}
      placeTitles={selectedPlaces.map((p) => p.title)}
      placeCategories={selectedPlaces.map((p) => p.category)}
    />
  );
}
