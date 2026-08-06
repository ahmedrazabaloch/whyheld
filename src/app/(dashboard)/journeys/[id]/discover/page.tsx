import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { loadDraft, loadJourney } from "@/actions/journey-actions";
import { DiscoveryView } from "@/components/discovery/DiscoveryView";
import {
  buildDestinationIntroduction,
  destinationDisplayName,
  parseDiscoveryState,
} from "@/components/discovery/discovery-data";
import { parseComposedJourney } from "@/lib/utils/composed-journey";
import { parseBuilderMeta } from "@/lib/journey/trip-shape";

export const metadata: Metadata = {
  title: "Discovery — Wayheld",
  description: "Explore places worth discovering before shaping your journey.",
};

export default async function JourneyDiscoverPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;

  const draftResponse = await loadDraft(id);
  if (draftResponse.success) {
    const draft = draftResponse.data;
    const destination = destinationDisplayName(draft.originQuery);
    const introduction = buildDestinationIntroduction(destination);
    const initialDiscovery = parseDiscoveryState(draft.metadata);
    const journeyTitle =
      draft.title && draft.title !== "Untitled Journey"
        ? draft.title
        : `Journey to ${destination}`;

    return (
      <DiscoveryView
        journeyId={draft.id}
        destination={destination}
        journeyTitle={journeyTitle}
        pace={draft.pace}
        feelings={parseBuilderMeta(draft.metadata).feelings}
        introduction={introduction}
        initialDiscovery={initialDiscovery}
        mode="setup"
      />
    );
  }

  const journey = await loadJourney(id);
  if (!journey) {
    notFound();
  }

  const composed = parseComposedJourney(journey.metadata);
  if (journey.status !== "READY" || !composed) {
    redirect(`/journeys/${id}`);
  }

  const destination = destinationDisplayName(journey.originQuery);
  const introduction = buildDestinationIntroduction(destination);
  const initialDiscovery = parseDiscoveryState(journey.metadata);
  const journeyTitle =
    journey.title && journey.title !== "Untitled Journey"
      ? journey.title
      : `Journey to ${destination}`;

  return (
    <DiscoveryView
      journeyId={journey.id}
      destination={destination}
      journeyTitle={journeyTitle}
      pace={journey.pace}
      feelings={parseBuilderMeta(journey.metadata).feelings}
      introduction={introduction}
      initialDiscovery={initialDiscovery}
      mode="edit"
      returnHref={`/journeys/${id}`}
    />
  );
}
