import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { executeAiPipeline } from "@/lib/ai/pipeline";
import { AiError } from "@/lib/ai/errors";
import type { ComposedJourney } from "@/lib/ai/schemas/composed-journey";
import { parseDiscoveryState } from "@/components/discovery/discovery-data";
import { persistComposedItinerary } from "@/actions/journey-actions";
import { normalizeComposedJourney } from "@/lib/utils/composed-journey";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const journey = await prisma.journey.findUnique({
    where: { id, userId: session.user.id },
    include: {
      stops: { select: { id: true }, take: 1 },
    },
  });

  if (!journey) {
    return NextResponse.json({ error: "Journey not found" }, { status: 404 });
  }

  // Already generated — do not regenerate
  if (journey.status === "READY" && journey.stops.length > 0) {
    return NextResponse.json({ alreadyGenerated: true, journeyId: journey.id });
  }

  const meta =
    journey.metadata &&
    typeof journey.metadata === "object" &&
    !Array.isArray(journey.metadata)
      ? (journey.metadata as Record<string, unknown>)
      : {};

  if (meta.composedJourney && journey.status === "READY") {
    return NextResponse.json({ alreadyGenerated: true, journeyId: journey.id });
  }

  const discovery = parseDiscoveryState(journey.metadata);
  if (!discovery || discovery.journeyPlaceIds.length === 0) {
    return NextResponse.json(
      {
        error:
          "Select at least one place in Discovery before generating your journey.",
      },
      { status: 400 },
    );
  }

  const selectedPlaces = discovery.places.filter((p) =>
    discovery.journeyPlaceIds.includes(p.id),
  );

  if (selectedPlaces.length === 0) {
    return NextResponse.json(
      {
        error:
          "Selected places could not be found. Return to Discovery and try again.",
      },
      { status: 400 },
    );
  }

  if (!journey.originQuery?.trim()) {
    return NextResponse.json(
      { error: "Destination is required before generating a journey." },
      { status: 400 },
    );
  }

  let duration = journey.durationDays;
  if (!duration && journey.startDate && journey.endDate) {
    const msPerDay = 86_400_000;
    duration = Math.max(
      1,
      Math.round(
        (journey.endDate.getTime() - journey.startDate.getTime()) / msPerDay,
      ),
    );
  }
  duration = duration || 5;

  await prisma.journey.update({
    where: { id: journey.id },
    data: { status: "GENERATING" },
  });

  try {
    const result = await executeAiPipeline<ComposedJourney>({
      promptId: "JOURNEY_FROM_DISCOVERY",
      userId: session.user.id,
      signal: request.signal,
      variables: {
        destination: journey.originQuery,
        pace: journey.pace || "GENTLY_BALANCED",
        budget: journey.budget || "COMFORTABLE",
        duration,
        selectedPlaces: selectedPlaces.map((p) => ({
          title: p.title,
          category: p.category,
          description: p.description,
          highlights: p.highlights,
        })),
        ...(journey.startDate
          ? { startDate: journey.startDate.toISOString().split("T")[0] }
          : {}),
        ...(journey.endDate
          ? { endDate: journey.endDate.toISOString().split("T")[0] }
          : {}),
      },
    });

    const days = result.days
      .slice()
      .sort((a, b) => a.dayNumber - b.dayNumber)
      .slice(0, duration)
      .map((day, index) => ({
        ...day,
        dayNumber: day.dayNumber || index + 1,
        placeTitles: day.placeTitles ?? [],
      }));

    if (days.length === 0) {
      await prisma.journey.update({
        where: { id: journey.id },
        data: { status: "FAILED" },
      });
      return NextResponse.json(
        { error: "The journey could not be arranged. Please try again." },
        { status: 502 },
      );
    }

    const persistResult = await persistComposedItinerary(
      journey.id,
      normalizeComposedJourney({
        title: result.title,
        summary: result.summary,
        notes: result.notes,
        days,
      }),
      undefined,
      "1.0.0",
    );

    if (!persistResult.success) {
      await prisma.journey.updateMany({
        where: { id: journey.id, status: "GENERATING" },
        data: { status: "FAILED" },
      });
      return NextResponse.json(
        { error: persistResult.error || "Failed to save journey." },
        { status: persistResult.code === "UNAUTHORIZED" ? 401 : 502 },
      );
    }

    return NextResponse.json({
      success: true,
      journeyId: journey.id,
      title: result.title,
    });
  } catch (error) {
    await prisma.journey.updateMany({
      where: { id: journey.id, status: "GENERATING" },
      data: { status: "FAILED" },
    });

    const message =
      error instanceof AiError
        ? error.message
        : "Something went wrong while preparing your journey.";
    const status =
      error instanceof AiError && error.code === "RATE_LIMIT_EXCEEDED" ? 429 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
