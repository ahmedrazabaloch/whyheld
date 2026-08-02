import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { loadJourney } from "@/actions/journey-actions";
import { JourneyComposeView } from "@/components/journey/JourneyComposeView";
import { parseComposedJourney } from "@/lib/utils/composed-journey";

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
  const journey = await loadJourney(id);

  if (!journey) {
    notFound();
  }

  const composed = parseComposedJourney(journey.metadata);
  const hasStops = (journey.stops?.length ?? 0) > 0;

  // Already generated — open the existing journey
  if (journey.status === "READY" && (composed || hasStops)) {
    redirect(`/journeys/${id}`);
  }

  return <JourneyComposeView journeyId={journey.id} />;
}
