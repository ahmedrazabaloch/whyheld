import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { addPlaceToJourney } from "@/lib/journey/add-place";

/**
 * POST /api/v1/journeys/add-place
 *
 * Request-based twin of the addPlaceToJourneyBoard server action. Explore uses
 * this so several places can be added at once: server actions are queued one at
 * a time by the client router and hold up navigation, while these run in
 * parallel and leave the router free.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Please sign in." } },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid JSON." } },
      { status: 400 },
    );
  }

  const result = await addPlaceToJourney(
    session.user.id,
    body as Parameters<typeof addPlaceToJourney>[1],
  );

  if (!result.ok) {
    const notFound = result.reason === "NOT_FOUND";
    return NextResponse.json(
      {
        error: {
          code: result.reason,
          message: notFound
            ? "That journey is no longer available."
            : "Could not add this place.",
        },
      },
      { status: notFound ? 404 : 422 },
    );
  }

  revalidatePath(`/journeys/${result.journeyId}`);
  revalidatePath(`/journeys/${result.journeyId}/discover`);
  revalidatePath("/journeys");

  return NextResponse.json({ journeyId: result.journeyId });
}
