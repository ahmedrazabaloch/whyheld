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

  // Setup flow — draft journeys
  const draftResponse = await loadDraft(id);
  if (draftResponse.success) {
    const draft = draftResponse.data;
    const destination = destinationDisplayName(draft.originQuery);
    const introduction = buildDestinationIntroduction(destination);
    const initialDiscovery = parseDiscoveryState(draft.metadata);

    return (
      <DiscoveryView
        journeyId={draft.id}
        destination={destination}
        introduction={introduction}
        initialDiscovery={initialDiscovery}
        mode="setup"
      />
    );
  }

  // Edit flow — reopen Discovery on a ready journey
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

  return (
    <DiscoveryView
      journeyId={journey.id}
      destination={destination}
      introduction={introduction}
      initialDiscovery={initialDiscovery}
      mode="edit"
      returnHref={
        from === "edit" ? `/journeys/${id}?edit=1` : `/journeys/${id}?edit=1`
      }
    />
  );
}
