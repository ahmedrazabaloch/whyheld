"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import type { Prisma, SavedPlaceKind } from "@prisma/client";
import {
  type ActionResponse,
  handleServerError,
} from "@/lib/utils/errors";
import {
  discoveryWishlistKey,
  formatWishlistDate,
  journeyWishlistKey,
  parseWishlistMetadata,
  type WishlistItemView,
  type WishlistPlaceMetadata,
  type WishlistSource,
} from "@/lib/wishlist/types";

const ToggleWishlistSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  kind: z.string().optional(),
  category: z.string().optional(),
  destination: z.string().optional(),
  journeyId: z.string().optional(),
  discoveryPlaceId: z.string().optional(),
  source: z.enum(["discovery", "journey"]).default("journey"),
  googlePlaceId: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type ToggleWishlistInput = z.infer<typeof ToggleWishlistSchema>;

function mapToSavedPlaceKind(kind?: string): SavedPlaceKind {
  if (!kind) return "DESTINATION";
  const upper = kind.toUpperCase();
  switch (upper) {
    case "STAY":
      return "STAY";
    case "EXPERIENCE":
      return "EXPERIENCE";
    case "MEAL":
    case "RESTAURANT":
      return "RESTAURANT";
    case "POINT_OF_INTEREST":
    case "HERITAGE_SITE":
      return "POINT_OF_INTEREST";
    default:
      return "DESTINATION";
  }
}

function buildMetadata(input: {
  source: WishlistSource;
  category: string;
  destination: string;
  journeyId: string | null;
  discoveryPlaceId?: string;
  wishlistKey: string;
}): Prisma.InputJsonValue {
  const meta: WishlistPlaceMetadata = {
    source: input.source,
    category: input.category,
    destination: input.destination,
    journeyId: input.journeyId,
    wishlistKey: input.wishlistKey,
  };
  if (input.discoveryPlaceId) meta.discoveryPlaceId = input.discoveryPlaceId;
  return meta as unknown as Prisma.InputJsonValue;
}

async function findByWishlistKey(userId: string, wishlistKey: string) {
  const places = await prisma.savedPlace.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return (
    places.find((p) => {
      const meta = parseWishlistMetadata(p.metadata);
      return meta?.wishlistKey === wishlistKey;
    }) ?? null
  );
}

/**
 * Toggle a place on the user Wishlist (SavedPlace).
 * Returns whether the place is now on the wishlist.
 */
export async function toggleWishlistPlace(
  rawInput: ToggleWishlistInput,
): Promise<ActionResponse<{ id: string | null; saved: boolean }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };
    }

    const userId = session.user.id;
    const input = ToggleWishlistSchema.parse(rawInput);
    const source = input.source;
    const journeyId = input.journeyId ?? null;
    const category = input.category || input.kind || "Place";
    const destination = input.destination?.trim() || "Unknown destination";

    const wishlistKey =
      source === "discovery" && journeyId && input.discoveryPlaceId
        ? discoveryWishlistKey(journeyId, input.discoveryPlaceId)
        : journeyWishlistKey(journeyId || "solo", input.name, input.googlePlaceId);

    // Prefer googlePlaceId unique when present
    let existing = input.googlePlaceId
      ? await prisma.savedPlace.findUnique({
          where: {
            userId_googlePlaceId: {
              userId,
              googlePlaceId: input.googlePlaceId,
            },
          },
        })
      : null;

    if (!existing) {
      existing = await findByWishlistKey(userId, wishlistKey);
    }

    if (existing) {
      await prisma.savedPlace.delete({ where: { id: existing.id } });

      if (
        source === "discovery" &&
        journeyId &&
        input.discoveryPlaceId
      ) {
        await removeDiscoveryWishlistId(userId, journeyId, input.discoveryPlaceId);
      }

      revalidateWishlistPaths(journeyId);
      return { success: true, data: { id: null, saved: false } };
    }

    const savedPlace = await prisma.savedPlace.create({
      data: {
        userId,
        name: input.name,
        kind: mapToSavedPlaceKind(input.kind || category),
        note: input.description || null,
        googlePlaceId: input.googlePlaceId || null,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        country: null,
        metadata: buildMetadata({
          source,
          category,
          destination,
          journeyId,
          discoveryPlaceId: input.discoveryPlaceId,
          wishlistKey,
        }),
      },
    });

    await prisma.userActivity.create({
      data: {
        userId,
        type: "PLACE_SAVED",
        targetType: "SavedPlace",
        targetId: savedPlace.id,
        metadata: {
          name: savedPlace.name,
          kind: savedPlace.kind,
          source,
          wishlistKey,
        },
      },
    });

    if (source === "discovery" && journeyId && input.discoveryPlaceId) {
      await addDiscoveryWishlistId(userId, journeyId, input.discoveryPlaceId);
    }

    revalidateWishlistPaths(journeyId);
    return { success: true, data: { id: savedPlace.id, saved: true } };
  } catch (error) {
    const appError = handleServerError(error, "toggleWishlistPlace");
    return {
      success: false,
      error: appError.message,
      code: appError.code,
    };
  }
}

/** @deprecated Prefer toggleWishlistPlace — kept for stop-card callers during rename. */
export async function saveStopAsPlace(
  rawInput: {
    name: string;
    description?: string;
    kind?: string;
    googlePlaceId?: string;
    latitude?: number;
    longitude?: number;
    note?: string;
    journeyId?: string;
    destination?: string;
  },
): Promise<ActionResponse<{ id: string; saved: boolean }>> {
  const result = await toggleWishlistPlace({
    name: rawInput.name,
    description: rawInput.description || rawInput.note,
    kind: rawInput.kind,
    googlePlaceId: rawInput.googlePlaceId,
    latitude: rawInput.latitude,
    longitude: rawInput.longitude,
    journeyId: rawInput.journeyId,
    destination: rawInput.destination,
    source: "journey",
    category: rawInput.kind,
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error,
      code: result.code,
    };
  }

  return {
    success: true,
    data: {
      id: result.data.id || "",
      saved: result.data.saved,
    },
  };
}

export async function removeSavedPlace(
  id: string,
): Promise<ActionResponse<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };
    }

    const place = await prisma.savedPlace.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!place) {
      return { success: false, error: "Place not found", code: "NOT_FOUND" };
    }

    const meta = parseWishlistMetadata(place.metadata);

    await prisma.savedPlace.delete({ where: { id: place.id } });

    if (meta?.source === "discovery" && meta.journeyId && meta.discoveryPlaceId) {
      await removeDiscoveryWishlistId(
        session.user.id,
        meta.journeyId,
        meta.discoveryPlaceId,
      );
    }

    revalidateWishlistPaths(meta?.journeyId ?? null);
    return { success: true, data: undefined };
  } catch (error) {
    const appError = handleServerError(error, "removeSavedPlace");
    return {
      success: false,
      error: appError.message,
      code: appError.code,
    };
  }
}

/**
 * Sync Discovery wishlist IDs into SavedPlace for a journey.
 * Called when Discovery persists wishlist state — no Discovery UI change.
 */
export async function syncDiscoveryWishlistToSavedPlaces(params: {
  userId: string;
  journeyId: string;
  destination: string;
  places: Array<{
    id: string;
    title: string;
    category: string;
    description: string;
    highlights: string[];
  }>;
  wishlistPlaceIds: string[];
  /** When false, skip cache revalidation (required during page render / hydrate). */
  revalidate?: boolean;
}): Promise<void> {
  const {
    userId,
    journeyId,
    destination,
    places,
    wishlistPlaceIds,
    revalidate = true,
  } = params;
  const wanted = new Set(wishlistPlaceIds);
  const placeById = new Map(places.map((p) => [p.id, p]));

  const existing = await prisma.savedPlace.findMany({ where: { userId } });
  const forThisJourney = existing.filter((sp) => {
    const meta = parseWishlistMetadata(sp.metadata);
    return meta?.source === "discovery" && meta.journeyId === journeyId;
  });

  for (const sp of forThisJourney) {
    const meta = parseWishlistMetadata(sp.metadata);
    const placeId = meta?.discoveryPlaceId;
    if (!placeId || !wanted.has(placeId)) {
      await prisma.savedPlace.delete({ where: { id: sp.id } });
    }
  }

  for (const placeId of wanted) {
    const place = placeById.get(placeId);
    if (!place) continue;

    const wishlistKey = discoveryWishlistKey(journeyId, placeId);
    const still = await findByWishlistKey(userId, wishlistKey);
    const metaPayload = buildMetadata({
      source: "discovery",
      category: place.category,
      destination,
      journeyId,
      discoveryPlaceId: place.id,
      wishlistKey,
    });

    if (still) {
      await prisma.savedPlace.update({
        where: { id: still.id },
        data: {
          name: place.title,
          note: place.description,
          metadata: metaPayload,
        },
      });
      continue;
    }

    await prisma.savedPlace.create({
      data: {
        userId,
        name: place.title,
        kind: "DESTINATION",
        note: place.description,
        metadata: metaPayload,
      },
    });
  }

  // Never call revalidatePath during RSC render (e.g. Wishlist page hydrate).
  if (revalidate) {
    revalidatePath("/wishlist");
  }
}

/**
 * Ensure Discovery wishlist entries across all journeys appear in SavedPlace.
 * Hydrates legacy in-metadata wishlist data into the shared Wishlist store.
 */
export async function hydrateWishlistFromJourneys(
  userId: string,
): Promise<void> {
  const journeys = await prisma.journey.findMany({
    where: { userId, deletedAt: null },
    select: { id: true, originQuery: true, metadata: true },
  });

  for (const journey of journeys) {
    const meta =
      journey.metadata &&
      typeof journey.metadata === "object" &&
      !Array.isArray(journey.metadata)
        ? (journey.metadata as Record<string, unknown>)
        : {};
    const discovery =
      meta.discovery &&
      typeof meta.discovery === "object" &&
      !Array.isArray(meta.discovery)
        ? (meta.discovery as Record<string, unknown>)
        : null;
    if (!discovery) continue;

    const places = Array.isArray(discovery.places) ? discovery.places : [];
    const wishlistPlaceIds = Array.isArray(discovery.wishlistPlaceIds)
      ? discovery.wishlistPlaceIds.filter((id): id is string => typeof id === "string")
      : [];
    if (wishlistPlaceIds.length === 0) continue;

    const normalizedPlaces = places
      .filter(
        (p): p is {
          id: string;
          title: string;
          category: string;
          description: string;
          highlights: string[];
        } =>
          !!p &&
          typeof p === "object" &&
          typeof (p as { id?: unknown }).id === "string" &&
          typeof (p as { title?: unknown }).title === "string",
      )
      .map((p) => ({
        id: p.id,
        title: p.title,
        category: typeof p.category === "string" ? p.category : "Place",
        description: typeof p.description === "string" ? p.description : "",
        highlights: Array.isArray(p.highlights)
          ? p.highlights.filter((h): h is string => typeof h === "string")
          : [],
      }));

    const destination =
      journey.originQuery?.split(",")[0]?.trim() ||
      journey.originQuery ||
      "Unknown destination";

    await syncDiscoveryWishlistToSavedPlaces({
      userId,
      journeyId: journey.id,
      destination,
      places: normalizedPlaces,
      wishlistPlaceIds,
      revalidate: false,
    });
  }
}

export async function loadWishlistItems(): Promise<WishlistItemView[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  await hydrateWishlistFromJourneys(session.user.id);

  const places = await prisma.savedPlace.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return places.map((place) => {
    const meta = parseWishlistMetadata(place.metadata);
    return {
      id: place.id,
      title: place.name,
      category: meta?.category || place.kind.replace(/_/g, " "),
      destination: meta?.destination || place.country || "Unknown destination",
      description: place.note || "",
      dateAdded: formatWishlistDate(place.createdAt),
      createdAt: place.createdAt.toISOString(),
      source: meta?.source || "journey",
      journeyId: meta?.journeyId ?? null,
    };
  });
}

export async function getWishlistKeysForJourney(
  journeyId: string,
): Promise<{ discoveryPlaceIds: string[]; stopKeys: string[] }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { discoveryPlaceIds: [], stopKeys: [] };
  }

  const places = await prisma.savedPlace.findMany({
    where: { userId: session.user.id },
  });

  const discoveryPlaceIds: string[] = [];
  const stopKeys: string[] = [];

  for (const place of places) {
    const meta = parseWishlistMetadata(place.metadata);
    if (!meta) continue;
    if (meta.journeyId !== journeyId && !meta.wishlistKey.startsWith("google:")) {
      continue;
    }
    if (meta.source === "discovery" && meta.discoveryPlaceId) {
      discoveryPlaceIds.push(meta.discoveryPlaceId);
    } else {
      stopKeys.push(meta.wishlistKey);
    }
  }

  return { discoveryPlaceIds, stopKeys };
}

async function addDiscoveryWishlistId(
  userId: string,
  journeyId: string,
  placeId: string,
) {
  const journey = await prisma.journey.findFirst({
    where: { id: journeyId, userId },
    select: { metadata: true },
  });
  if (!journey) return;

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

  const prevIds = Array.isArray(prevDiscovery.wishlistPlaceIds)
    ? prevDiscovery.wishlistPlaceIds.filter((id): id is string => typeof id === "string")
    : [];
  if (prevIds.includes(placeId)) return;

  await prisma.journey.update({
    where: { id: journeyId },
    data: {
      metadata: {
        ...prevMeta,
        discovery: {
          ...prevDiscovery,
          places: Array.isArray(prevDiscovery.places) ? prevDiscovery.places : [],
          journeyPlaceIds: Array.isArray(prevDiscovery.journeyPlaceIds)
            ? prevDiscovery.journeyPlaceIds
            : [],
          wishlistPlaceIds: [...prevIds, placeId],
        },
      } as Prisma.InputJsonValue,
    },
  });
}

async function removeDiscoveryWishlistId(
  userId: string,
  journeyId: string,
  placeId: string,
) {
  const journey = await prisma.journey.findFirst({
    where: { id: journeyId, userId },
    select: { metadata: true },
  });
  if (!journey) return;

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

  const prevIds = Array.isArray(prevDiscovery.wishlistPlaceIds)
    ? prevDiscovery.wishlistPlaceIds.filter((id): id is string => typeof id === "string")
    : [];

  await prisma.journey.update({
    where: { id: journeyId },
    data: {
      metadata: {
        ...prevMeta,
        discovery: {
          ...prevDiscovery,
          places: Array.isArray(prevDiscovery.places) ? prevDiscovery.places : [],
          journeyPlaceIds: Array.isArray(prevDiscovery.journeyPlaceIds)
            ? prevDiscovery.journeyPlaceIds
            : [],
          wishlistPlaceIds: prevIds.filter((id) => id !== placeId),
        },
      } as Prisma.InputJsonValue,
    },
  });
}

function revalidateWishlistPaths(journeyId: string | null) {
  revalidatePath("/wishlist");
  revalidatePath("/dashboard");
  if (journeyId) {
    revalidatePath(`/journeys/${journeyId}`);
    revalidatePath(`/journeys/${journeyId}/discover`);
  }
}
