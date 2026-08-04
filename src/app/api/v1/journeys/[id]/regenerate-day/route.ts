import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { executeAiPipeline } from "@/lib/ai/pipeline";
import { AiError } from "@/lib/ai/errors";
import type { RegeneratedDay } from "@/lib/ai/schemas/composed-journey";
import {
  normalizeComposedDay,
  normalizeComposedJourney,
  parseComposedJourney,
} from "@/lib/utils/composed-journey";
import { parseDiscoveryState } from "@/components/discovery/discovery-data";
import { saveComposedJourneyEdits } from "@/actions/journey-actions";
import {
  evaluateAccessGate,
  parseAccessExpiresAt,
} from "@/lib/journey/access";

const BodySchema = z.object({
  dayNumber: z.number().int().min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof BodySchema>;
  try {
    const raw = await request.json();
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    body = parsed.data;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const journey = await prisma.journey.findUnique({
    where: { id, userId: session.user.id },
  });

  if (!journey) {
    return NextResponse.json({ error: "Journey not found" }, { status: 404 });
  }

  if (journey.status !== "READY") {
    return NextResponse.json(
      { error: "Only ready journeys can regenerate a day." },
      { status: 400 },
    );
  }

  const composed = parseComposedJourney(journey.metadata, {
    fallbackCountry: journey.originQuery?.split(",")[0]?.trim() || journey.originQuery || undefined,
  });
  if (!composed) {
    return NextResponse.json(
      { error: "No composed itinerary found on this journey." },
      { status: 400 },
    );
  }

  const dayIndex = composed.days.findIndex((d) => d.dayNumber === body.dayNumber);
  if (dayIndex < 0) {
    return NextResponse.json({ error: "Day not found." }, { status: 404 });
  }

  const currentDay = composed.days[dayIndex]!;
  const discovery = parseDiscoveryState(journey.metadata);
  const placeLookup = new Map(
    (discovery?.places ?? []).map((p) => [p.id, p] as const),
  );
  const titleLookup = new Map(
    (discovery?.places ?? []).map(
      (p) => [p.title.trim().toLowerCase(), p] as const,
    ),
  );

  const dayPlaces = (currentDay.places ?? []).map((slot) => {
    const fromId = placeLookup.get(slot.id);
    const fromTitle = titleLookup.get(slot.title.trim().toLowerCase());
    const place = fromId || fromTitle;
    return {
      id: slot.id,
      title: slot.title,
      locked: slot.locked === true,
      category: place?.category || "Place",
      description: place?.description || "",
    };
  });

  const lockedPlaces = dayPlaces.filter((p) => p.locked);

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
  duration = duration || composed.days.length || 5;

  if (!journey.originQuery?.trim()) {
    return NextResponse.json(
      { error: "Destination is required." },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });
  const refinementsUsed = await prisma.journeyRefinement.count({
    where: { journeyId: journey.id, type: { not: "INITIAL" } },
  });
  const gate = evaluateAccessGate({
    accessExpiresAt: parseAccessExpiresAt(journey.metadata),
    refinementsUsed,
    plan: user?.plan || "FREE",
  });
  if (!gate.ok) {
    return NextResponse.json({ error: gate.message }, { status: 403 });
  }

  try {
    const result = await executeAiPipeline<RegeneratedDay>({
      promptId: "REGENERATE_JOURNEY_DAY",
      userId: session.user.id,
      signal: request.signal,
      variables: {
        destination: journey.originQuery,
        pace: journey.pace || "GENTLY_BALANCED",
        budget: journey.budget || "COMFORTABLE",
        duration,
        dayNumber: body.dayNumber,
        dayPlaces,
        lockedPlaces,
        currentTheme: currentDay.theme || "",
        currentTransition: currentDay.transition || "",
        ...(journey.startDate
          ? { startDate: journey.startDate.toISOString().split("T")[0] }
          : {}),
        ...(journey.endDate
          ? { endDate: journey.endDate.toISOString().split("T")[0] }
          : {}),
      },
    });

    const destinationLabel =
      journey.originQuery?.split(",")[0]?.trim() ||
      journey.originQuery?.trim() ||
      undefined;

    const regenerated = normalizeComposedDay(
      {
        ...result,
        dayNumber: body.dayNumber,
        places: (currentDay.places ?? []).map((slot) => ({
          ...slot,
          locked: slot.locked === true,
        })),
        placeTitles: (currentDay.places ?? []).map((p) => p.title),
      },
      destinationLabel,
    );

    // If AI returned places with locks, merge titles carefully
    if (Array.isArray(result.places) && result.places.length > 0) {
      const byTitle = new Map(
        result.places.map((p) => [p.title.trim().toLowerCase(), p] as const),
      );
      regenerated.places = (currentDay.places ?? []).map((slot) => {
        const match = byTitle.get(slot.title.trim().toLowerCase());
        return {
          id: slot.id,
          title: slot.title,
          locked: slot.locked === true || match?.locked === true,
        };
      });
      regenerated.placeTitles = regenerated.places.map((p) => p.title);
    }

    const nextComposed = normalizeComposedJourney(
      {
        ...composed,
        days: composed.days.map((d, i) => (i === dayIndex ? regenerated : d)),
      },
      { fallbackCountry: destinationLabel },
    );

    const persist = await saveComposedJourneyEdits(journey.id, nextComposed);
    if (!persist.success) {
      return NextResponse.json(
        { error: persist.error || "Failed to save regenerated day." },
        { status: 502 },
      );
    }

    await prisma.journeyRefinement.create({
      data: {
        journeyId: journey.id,
        type: "FREEFORM",
        instruction: `Regenerated day ${body.dayNumber}`,
        fromVersion: journey.version,
        toVersion: journey.version + 1,
        params: { dayNumber: body.dayNumber },
      },
    });
    await prisma.journey.update({
      where: { id: journey.id },
      data: { version: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      day: regenerated,
      composed: nextComposed,
    });
  } catch (error) {
    const message =
      error instanceof AiError
        ? error.message
        : "Something went wrong while regenerating this day.";
    const status =
      error instanceof AiError && error.code === "RATE_LIMIT_EXCEEDED" ? 429 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
