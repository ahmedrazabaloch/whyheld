import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { executeAiPipeline } from "@/lib/ai/pipeline";
import { AiError } from "@/lib/ai/errors";
import type { DiscoveryPlacesOutput } from "@/lib/ai/schemas/discovery";
import { exploreFilterPromptText } from "@/lib/explore/filters";

const BodySchema = z.object({
  destination: z.string().trim().min(2).max(120),
  count: z.union([z.literal(5), z.literal(10)]).default(10),
  excludeTitles: z.array(z.string()).max(40).default([]),
  selectedTitles: z.array(z.string()).max(40).default([]),
  wishlistTitles: z.array(z.string()).max(40).default([]),
  filters: z.array(z.string().min(1).max(40)).max(10).default([]),
});

/**
 * Destination-only place discovery — no journey prefs required.
 * Used by the standalone Explore tab.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof BodySchema>;
  try {
    const raw = await request.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Enter a country, city, or place to explore." },
        { status: 400 },
      );
    }
    body = parsed.data;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const filterText = exploreFilterPromptText(body.filters);

    const result = await executeAiPipeline<DiscoveryPlacesOutput>({
      promptId: "DISCOVERY_PLACES",
      userId: session.user.id,
      variables: {
        destination: body.destination,
        pace: "GENTLY_BALANCED",
        duration: 5,
        count: body.count,
        excludeTitles: body.excludeTitles,
        selectedTitles: body.selectedTitles,
        wishlistTitles: body.wishlistTitles,
        ...(filterText ? { exploreFilters: filterText } : {}),
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
        ...(p.localTips ? { localTips: p.localTips } : {}),
        ...(p.guideNote ? { guideNote: p.guideNote } : {}),
        ...(p.weatherNote ? { weatherNote: p.weatherNote } : {}),
      }));

    if (places.length === 0) {
      return NextResponse.json(
        { error: "No new places could be gathered. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ places, destination: body.destination });
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
