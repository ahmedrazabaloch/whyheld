import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { executeAiPipeline } from "@/lib/ai/pipeline";
import { AiError } from "@/lib/ai/errors";
import type { DiscoveryPlacesOutput } from "@/lib/ai/schemas/discovery";
import { parseBuilderMeta } from "@/lib/journey/trip-shape";
import { feelingPromptText, paceFromFeelings } from "@/lib/journey/feelings";

const BodySchema = z.object({
  count: z.union([z.literal(5), z.literal(10)]).default(10),
  excludeTitles: z.array(z.string()).max(40).default([]),
  selectedTitles: z.array(z.string()).max(40).default([]),
  wishlistTitles: z.array(z.string()).max(40).default([]),
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
    const raw = await request.json().catch(() => ({}));
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

  if (!journey.originQuery?.trim()) {
    return NextResponse.json(
      { error: "Destination is required before discovery." },
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

  try {
    const builderMeta = parseBuilderMeta(journey.metadata);
    const feelingText = feelingPromptText(builderMeta.feelings);
    const derivedPace = paceFromFeelings(builderMeta.feelings);
    const mustVisitTitles = builderMeta.tripShape.mustVisit.map((p) => p.name);

    const result = await executeAiPipeline<DiscoveryPlacesOutput>({
      promptId: "DISCOVERY_PLACES",
      userId: session.user.id,
      // Do not forward request.signal: React Strict Mode / remounts abort the
      // first HTTP client request and previously caused a spurious 502 while a
      // second Discover call succeeded. Timeouts still apply inside the provider.
      variables: {
        destination: journey.originQuery,
        pace:
          builderMeta.feelings.length > 0
            ? derivedPace
            : journey.pace || "GENTLY_BALANCED",
        budget: journey.budget || "COMFORTABLE",
        duration,
        count: body.count,
        excludeTitles: body.excludeTitles,
        selectedTitles: [...body.selectedTitles, ...mustVisitTitles],
        wishlistTitles: body.wishlistTitles,
        ...(feelingText ? { feelings: feelingText } : {}),
        ...(mustVisitTitles.length
          ? { mustVisit: mustVisitTitles.join("; ") }
          : {}),
        ...(journey.startDate
          ? { startDate: journey.startDate.toISOString().split("T")[0] }
          : {}),
        ...(journey.endDate
          ? { endDate: journey.endDate.toISOString().split("T")[0] }
          : {}),
      },
    });

    const excludeSet = new Set(
      [...body.excludeTitles, ...body.selectedTitles, ...body.wishlistTitles].map(
        (t) => t.trim().toLowerCase(),
      ),
    );

    const places = result.places
      .filter((p) => !excludeSet.has(p.title.trim().toLowerCase()))
      .slice(0, body.count)
      .map((p) => ({
        category: p.category,
        title: p.title,
        description: p.description,
        highlights: p.highlights,
      }));

    if (places.length === 0) {
      return NextResponse.json(
        { error: "No new places could be gathered. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ places });
  } catch (error) {
    if (request.signal.aborted) {
      return new NextResponse(null, { status: 499 });
    }

    const message =
      error instanceof AiError
        ? error.message
        : "Something went wrong while gathering places.";
    const status =
      error instanceof AiError && error.code === "RATE_LIMIT_EXCEEDED" ? 429 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
