import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export const DiscoveryPlacePersistSchema = z.object({
  id: z.string().min(1),
  category: z.string(),
  title: z.string(),
  description: z.string(),
  highlights: z.array(z.string()),
  localTips: z.string().optional(),
  guideNote: z.string().optional(),
  weatherNote: z.string().optional(),
});

export const AssignPlaceSchema = z.object({
  targetJourneyId: z.string().cuid(),
  place: DiscoveryPlacePersistSchema,
});

export type AssignPlaceInput = z.infer<typeof AssignPlaceSchema>;

/** True when a journey's metadata already holds discovery places. */
export function hasDiscoveryPlaces(metadata: unknown): boolean {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return false;
  }
  const discovery = (metadata as Record<string, unknown>).discovery;
  if (!discovery || typeof discovery !== "object" || Array.isArray(discovery)) {
    return false;
  }
  const places = (discovery as Record<string, unknown>).places;
  return Array.isArray(places) && places.length > 0;
}

export type AddPlaceResult =
  | {
      ok: true;
      journeyId: string;
      /** Day the place landed on, for READY journeys with a composed itinerary. */
      dayNumber?: number;
    }
  | { ok: false; reason: "VALIDATION_ERROR" | "NOT_FOUND" };

/**
 * Adds (or upserts) a Discovery place onto a journey board.
 *
 * Lives outside the server-action module so it can also be reached through a
 * route handler. Server actions are queued one at a time by the client router,
 * which makes rapid "add to journey" taps on Explore feel serialised and blocks
 * navigation behind the queue; a plain request has neither constraint.
 */
export async function addPlaceToJourney(
  userId: string,
  input: AssignPlaceInput,
): Promise<AddPlaceResult> {
  const parsed = AssignPlaceSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, reason: "VALIDATION_ERROR" };
  }

  const { targetJourneyId, place } = parsed.data;

  const journey = await prisma.journey.findUnique({
    where: {
      id: targetJourneyId,
      userId,
      status: { in: ["DRAFT", "GENERATING", "FAILED", "READY"] },
    },
    select: { id: true, metadata: true, status: true },
  });

  if (!journey) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  const prevMeta =
    journey.metadata &&
    typeof journey.metadata === "object" &&
    !Array.isArray(journey.metadata)
      ? (journey.metadata as Record<string, unknown>)
      : {};
  const prevDiscovery =
    prevMeta.discovery &&
    typeof prevMeta.discovery === "object" &&
    !Array.isArray(prevMeta.discovery)
      ? (prevMeta.discovery as Record<string, unknown>)
      : {};

  const prevPlaces = Array.isArray(prevDiscovery.places)
    ? [...(prevDiscovery.places as unknown[])]
    : [];
  const prevIds = Array.isArray(prevDiscovery.journeyPlaceIds)
    ? (prevDiscovery.journeyPlaceIds as unknown[]).filter(
        (id): id is string => typeof id === "string",
      )
    : [];
  const prevWishlist = Array.isArray(prevDiscovery.wishlistPlaceIds)
    ? (prevDiscovery.wishlistPlaceIds as unknown[]).filter(
        (id): id is string => typeof id === "string",
      )
    : [];

  const existingIdx = prevPlaces.findIndex(
    (p) =>
      !!p &&
      typeof p === "object" &&
      ((p as { id?: string }).id === place.id ||
        (typeof (p as { title?: string }).title === "string" &&
          (p as { title: string }).title.toLowerCase() ===
            place.title.toLowerCase())),
  );

  let placeId = place.id;
  if (existingIdx >= 0) {
    const existing = prevPlaces[existingIdx] as { id?: string };
    placeId = existing.id || place.id;
    prevPlaces[existingIdx] = { ...place, id: placeId };
  } else {
    prevPlaces.push(place);
  }

  const journeyPlaceIds = prevIds.includes(placeId)
    ? prevIds
    : [...prevIds, placeId];

  const nextMeta: Record<string, unknown> = {
    ...prevMeta,
    discovery: {
      places: prevPlaces,
      journeyPlaceIds,
      wishlistPlaceIds: prevWishlist.filter((id) => id !== placeId),
      boardStatus:
        prevDiscovery.boardStatus === "COMPLETE" ? "COMPLETE" : "PENDING",
    },
  };

  let addedToDay: number | undefined;

  // READY journeys render from composedJourney — add the place into a day.
  if (journey.status === "READY") {
    const { parseComposedJourney } = await import(
      "@/lib/utils/composed-journey"
    );
    const { addPlaceToDay } = await import("@/components/journey/composed-edit");

    const composed = parseComposedJourney(journey.metadata);
    if (composed && composed.days.length > 0) {
      const alreadyIn = composed.days.some((day) =>
        (day.places ?? []).some(
          (p) =>
            p.id === placeId ||
            p.title.trim().toLowerCase() === place.title.trim().toLowerCase(),
        ),
      );

      if (!alreadyIn) {
        const targetDay = composed.days.reduce((best, day) => {
          const bestCount = best.places?.length ?? 0;
          const dayCount = day.places?.length ?? 0;
          return dayCount < bestCount ? day : best;
        }, composed.days[0]!);

        const nextComposed = addPlaceToDay(composed, targetDay.dayNumber, {
          id: placeId,
          category: place.category,
          title: place.title,
          description: place.description,
          highlights: place.highlights,
          localTips: place.localTips,
          guideNote: place.guideNote,
          weatherNote: place.weatherNote,
        });

        nextMeta.composedJourney = nextComposed;
        nextMeta.aiDays = nextComposed.days;
        nextMeta.lastEditedAt = new Date().toISOString();
        addedToDay = targetDay.dayNumber;
      } else {
        addedToDay = composed.days.find((day) =>
          (day.places ?? []).some(
            (p) =>
              p.id === placeId ||
              p.title.trim().toLowerCase() === place.title.trim().toLowerCase(),
          ),
        )?.dayNumber;
      }
    }
  }

  await prisma.journey.update({
    where: { id: journey.id, userId },
    data: {
      metadata: nextMeta as Prisma.InputJsonValue,
    },
  });

  return {
    ok: true,
    journeyId: journey.id,
    ...(addedToDay !== undefined ? { dayNumber: addedToDay } : {}),
  };
}
