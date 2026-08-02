"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import type { Journey, Prisma } from "@prisma/client";
import type { AiStreamEvent } from "@/lib/ai/types";
import { 
  type ActionResponse, 
  handleServerError, 
  getUserFriendlyMessage 
} from "@/lib/utils/errors";
import { syncDiscoveryWishlistToSavedPlaces } from "@/actions/place-actions";

// Zod schemas for input validation
const IdSchema = z.string().cuid();

const UpdateDraftSchema = z.object({
  title: z.string().optional(),
  originQuery: z.string().nullable().optional(),
  primaryCountry: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
  startDate: z.date().nullable().optional(),
  endDate: z.date().nullable().optional(),
  durationDays: z.number().int().min(1).max(30).nullable().optional(),
  pace: z.enum(["ONE_PLACE_DEEPLY", "SLOW_UNHURRIED", "GENTLY_BALANCED"]).nullable().optional(),
  budget: z.enum(["MODEST", "COMFORTABLE", "PREMIUM", "LUXURY"]).nullable().optional(),
  lastCompletedStep: z.number().int().min(0).max(5).optional(),
});

export async function createDraft(): Promise<ActionResponse<string>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };
    }

    // Prevent duplicate draft creation: 
    // If the user already has an empty DRAFT created in the last 24h that hasn't been advanced,
    // just return that one instead of spamming rows.
    const existingEmptyDraft = await prisma.journey.findFirst({
      where: { 
        userId: session.user.id, 
        status: "DRAFT",
        title: "Untitled Journey",
      },
      orderBy: { createdAt: "desc" },
      select: { id: true }
    });

    if (existingEmptyDraft) {
      return { success: true, data: existingEmptyDraft.id };
    }

    const journey = await prisma.journey.create({
      data: {
        userId: session.user.id,
        title: "Untitled Journey",
        status: "DRAFT",
        metadata: { lastCompletedStep: 0 },
      },
    });

    return { success: true, data: journey.id };
  } catch (error) {
    const err = handleServerError(error, "createDraft");
    return { success: false, error: getUserFriendlyMessage(err.code), code: err.code, referenceId: err.referenceId };
  }
}

export async function loadDraft(id: string): Promise<ActionResponse<Journey>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };
    }

    const parsedId = IdSchema.safeParse(id);
    if (!parsedId.success) {
      return { success: false, error: "Invalid journey ID", code: "INVALID_INPUT" };
    }

    const journey = await prisma.journey.findUnique({
      where: { id: parsedId.data, userId: session.user.id },
    });

    if (!journey || !["DRAFT", "GENERATING", "FAILED"].includes(journey.status)) {
      return { success: false, error: "Draft not found or already generated.", code: "NOT_FOUND" };
    }

    return { success: true, data: journey };
  } catch (error) {
    const err = handleServerError(error, "loadDraft");
    return { success: false, error: getUserFriendlyMessage(err.code), code: err.code, referenceId: err.referenceId };
  }
}

export async function updateDraft(id: string, data: z.infer<typeof UpdateDraftSchema>): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };
    }

    const parsedId = IdSchema.safeParse(id);
    if (!parsedId.success) {
      return { success: false, error: "Invalid journey ID", code: "INVALID_INPUT" };
    }

    const parsedData = UpdateDraftSchema.safeParse(data);
    if (!parsedData.success) {
      return { success: false, error: "Invalid payload data", code: "VALIDATION_ERROR" };
    }

    const { lastCompletedStep, ...fields } = parsedData.data;

    // Merge metadata so builder autosave never wipes discovery selections.
    let metadataUpdate: Prisma.InputJsonValue | undefined;
    if (lastCompletedStep !== undefined) {
      const existing = await prisma.journey.findUnique({
        where: { id: parsedId.data, userId: session.user.id, status: "DRAFT" },
        select: { metadata: true },
      });
      const prev =
        existing?.metadata &&
        typeof existing.metadata === "object" &&
        !Array.isArray(existing.metadata)
          ? (existing.metadata as Record<string, unknown>)
          : {};
      metadataUpdate = { ...prev, lastCompletedStep };
    }

    await prisma.journey.update({
      where: { id: parsedId.data, userId: session.user.id, status: "DRAFT" },
      data: {
        ...fields,
        ...(metadataUpdate !== undefined ? { metadata: metadataUpdate } : {}),
      },
    });

    // NOTE: revalidatePath intentionally omitted here.
    // updateDraft is called exclusively by the background autosave in useJourneyBuilder.
    // The client already maintains optimistic local state; revalidating would cause
    // unnecessary RSC payload generation and network overhead on every keystroke.
    return { success: true, data: undefined };
  } catch (error) {
    const err = handleServerError(error, "updateDraft");
    return { success: false, error: getUserFriendlyMessage(err.code), code: err.code, referenceId: err.referenceId };
  }
}

const AppendEventsPayloadSchema = z.array(
  z.union([
    z.object({
      type: z.literal("status"),
      message: z.string().optional()
    }).passthrough(),
    z.object({
      type: z.literal("day"),
      index: z.number().int().min(0),
      payload: z.any()
    }).passthrough(),
    z.object({
      type: z.string()
    }).passthrough()
  ])
);

/**
 * Helper to extract individual stops from streamed/finalized day objects or flat stops.
 */
function extractFlatStops(items: any[]): Array<{
  name: string;
  kind: string;
  description: string;
  nights: number;
  dayStart: number;
  dayEnd: number;
  googlePlaceId: string | null;
  latitude: number | null;
  longitude: number | null;
  highlights: string[];
  metadata: any;
}> {
  const flattened: any[] = [];

  for (const item of items) {
    // Case 1: Item is a DayObject containing a `stops` array
    if (item && Array.isArray(item.stops) && item.stops.length > 0) {
      const dayNumber = item.dayNumber || 1;
      const dayTheme = item.theme || "";
      const daySummary = item.summary || "";

      for (const stop of item.stops) {
        flattened.push({
          name: stop.name || "Stop",
          kind: stop.kind || "EXPERIENCE",
          description: stop.description || "",
          nights: stop.nights ?? 1,
          dayStart: stop.dayStart ?? dayNumber,
          dayEnd: stop.dayEnd ?? dayNumber,
          googlePlaceId: stop.googlePlaceId || null,
          latitude: stop.latitude || null,
          longitude: stop.longitude || null,
          highlights: stop.highlights || [],
          metadata: {
            dayNumber,
            dayTheme,
            daySummary,
            ...(stop.metadata || {}),
          },
        });
      }
    } else if (item && typeof item === "object") {
      // Case 2: Item is directly a stop object
      flattened.push({
        name: item.name || item.title || "Stop",
        kind: item.kind || "EXPERIENCE",
        description: item.description || item.summary || "",
        nights: item.nights ?? 1,
        dayStart: item.dayStart ?? item.dayNumber ?? 1,
        dayEnd: item.dayEnd ?? item.dayNumber ?? 1,
        googlePlaceId: item.googlePlaceId || null,
        latitude: item.latitude || null,
        longitude: item.longitude || null,
        highlights: item.highlights || [],
        metadata: item.metadata || null,
      });
    }
  }

  return flattened;
}

export async function appendGenerationEvent(journeyId: string, events: AiStreamEvent[]): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };
    }

    const parsedEvents = AppendEventsPayloadSchema.safeParse(events);
    if (!parsedEvents.success) {
      return { success: false, error: "Invalid events payload", code: "VALIDATION_ERROR" };
    }
    const validEvents = parsedEvents.data as AiStreamEvent[];

    // Determine if we need to update the journey status
    const hasConnectingStatus = validEvents.some(
      (e) => e.type === "status" && e.message === "Connecting to AI..."
    );

    if (hasConnectingStatus) {
      await prisma.journey.updateMany({
        where: { id: journeyId, userId: session.user.id, status: { in: ["DRAFT", "FAILED"] } },
        data: { status: "GENERATING" }
      });
    }

    // Filter for day events to persist incrementally
    const dayEvents = validEvents.filter((e) => e.type === "day");
    
    if (dayEvents.length > 0) {
      const dayPayloads = dayEvents.map((e) => (e as any).payload);
      const flatStops = extractFlatStops(dayPayloads);

      // Use a transaction to perform idempotent upserts based on global stop order
      await prisma.$transaction(async (tx) => {
        for (let idx = 0; idx < flatStops.length; idx++) {
          const stop = flatStops[idx];
          const order = idx + 1;

          const data = {
            name: stop.name,
            description: stop.description,
            latitude: stop.latitude,
            longitude: stop.longitude,
            googlePlaceId: stop.googlePlaceId,
            kind: (stop.kind as any) || "EXPERIENCE",
            nights: stop.nights,
            dayStart: stop.dayStart,
            dayEnd: stop.dayEnd,
            highlights: stop.highlights,
            metadata: stop.metadata
          };

          await tx.journeyStop.upsert({
            where: {
              journeyId_order: {
                journeyId,
                order
              }
            },
            update: data,
            create: {
              ...data,
              journeyId,
              order
            }
          });
        }
      });
    }

    return { success: true, data: undefined };
  } catch (error) {
    const err = handleServerError(error, "appendGenerationEvent");
    return { success: false, error: getUserFriendlyMessage(err.code), code: err.code, referenceId: err.referenceId };
  }
}

export async function completeJourneyGeneration(
  journeyId: string, 
  finalStops: any[], 
  metadata: any, 
  usage: any,
  promptVersion?: string
): Promise<ActionResponse<Journey>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };
    }

    const journey = await prisma.journey.findUnique({
      where: { id: journeyId, userId: session.user.id }
    });

    if (!journey) {
      return { success: false, error: "Journey not found", code: "NOT_FOUND" };
    }

    // Pre-transaction Domain Validation
    if (!finalStops || finalStops.length === 0) {
      throw new Error("Validation failed: Generation resulted in 0 stops.");
    }

    const summary = metadata?.summary;
    if (summary === null || summary === undefined || summary === "" || (typeof summary === "string" && summary.trim() === "")) {
      throw new Error("Validation failed: Generation summary is missing or empty.");
    }

    const flatStops = extractFlatStops(finalStops);
    if (flatStops.length === 0) {
      throw new Error("Validation failed: Generation resulted in 0 valid stops.");
    }

    // Final DB transaction
    const updatedJourney = await prisma.$transaction(async (tx) => {
      // 1. Delete any existing stops (in case of a retry that partially wrote)
      await tx.journeyStop.deleteMany({
        where: { journeyId }
      });

      // 2. Create the new stops from flattened list
      await tx.journeyStop.createMany({
        data: flatStops.map((stop, index) => ({
          journeyId,
          order: index + 1,
          name: stop.name,
          description: stop.description,
          latitude: stop.latitude,
          longitude: stop.longitude,
          googlePlaceId: stop.googlePlaceId,
          kind: (stop.kind as any) || "EXPERIENCE",
          nights: stop.nights,
          dayStart: stop.dayStart,
          dayEnd: stop.dayEnd,
          highlights: stop.highlights,
          metadata: stop.metadata
        }))
      });

      // 3. Concurrency-safe atomic credit deduction
      const currentUser = await tx.user.findUnique({ where: { id: session.user.id } });
      if (currentUser?.plan !== "PREMIUM") {
        const deductionResult = await tx.creditWallet.updateMany({
          where: { userId: session.user.id, balance: { gt: 0 } },
          data: { balance: { decrement: 1 }, lifetimeConsumed: { increment: 1 } }
        });
        
        if (deductionResult.count === 0) {
          throw new Error("Insufficient AI credits");
        }

        // Fetch the wallet to attach its ID and new balance to the transaction ledger
        const updatedWallet = await tx.creditWallet.findUnique({ where: { userId: session.user.id } });
        if (updatedWallet) {
          await tx.creditTransaction.create({
            data: {
              walletId: updatedWallet.id,
              userId: session.user.id,
              type: "CONSUMPTION",
              amount: -1,
              balanceAfter: updatedWallet.balance,
              reason: "JOURNEY_GENERATION",
              journeyId: journeyId
            }
          });
        }
      }

      // 4. Update the Journey metadata and status
      const existingMetadata = (journey.metadata as Prisma.JsonObject) || {};
      
      const result = await tx.journey.update({
        where: { id: journeyId },
        data: {
          status: "READY",
          summary: metadata?.summary || journey.summary,
          title: metadata?.title || journey.title,
          metadata: {
            ...existingMetadata,
            aiSummary: metadata?.summary,
            aiDurationDays: metadata?.durationDays,
            aiDays: finalStops, // preserve raw structured days array
            usage,
            promptVersion
          }
        }
      });

      return result;
    });

    revalidatePath(`/journeys/${journeyId}`);
    revalidatePath(`/journeys/${journeyId}/build`);
    
    return { success: true, data: updatedJourney };
  } catch (error) {
    const err = handleServerError(error, "completeJourneyGeneration");
    return { success: false, error: getUserFriendlyMessage(err.code), code: err.code, referenceId: err.referenceId };
  }
}

export async function loadJourney(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    const parsedId = IdSchema.safeParse(id);
    if (!parsedId.success) return null;

    const journey = await prisma.journey.findUnique({
      where: { id: parsedId.data, userId: session.user.id },
      include: {
        stops: {
          orderBy: { order: "asc" }
        }
      }
    });

    return journey;
  } catch (error) {
    return null;
  }
}

export async function renameJourney(id: string, newTitle: string): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };
    }

    const parsedId = IdSchema.safeParse(id);
    if (!parsedId.success) {
      return { success: false, error: "Invalid journey ID", code: "INVALID_INPUT" };
    }

    const parsedTitle = z.string().trim().min(1, "Title cannot be empty").max(100, "Title is too long").safeParse(newTitle);
    if (!parsedTitle.success) {
      return { success: false, error: parsedTitle.error.issues[0]?.message ?? "Validation error", code: "VALIDATION_ERROR" };
    }

    await prisma.journey.update({
      where: { id: parsedId.data, userId: session.user.id },
      data: { title: parsedTitle.data },
    });

    revalidatePath("/journeys");
    revalidatePath(`/journeys/${parsedId.data}`);
    return { success: true, data: undefined };
  } catch (error) {
    const err = handleServerError(error, "renameJourney");
    return { success: false, error: getUserFriendlyMessage(err.code), code: err.code, referenceId: err.referenceId };
  }
}

export async function archiveJourney(id: string): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };
    }

    const parsedId = IdSchema.safeParse(id);
    if (!parsedId.success) {
      return { success: false, error: "Invalid journey ID", code: "INVALID_INPUT" };
    }

    await prisma.journey.update({
      where: { id: parsedId.data, userId: session.user.id },
      data: { status: "ARCHIVED" },
    });

    revalidatePath("/journeys");
    revalidatePath(`/journeys/${parsedId.data}`);
    return { success: true, data: undefined };
  } catch (error) {
    const err = handleServerError(error, "archiveJourney");
    return { success: false, error: getUserFriendlyMessage(err.code), code: err.code, referenceId: err.referenceId };
  }
}

export async function deleteJourney(id: string): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };
    }

    const parsedId = IdSchema.safeParse(id);
    if (!parsedId.success) {
      return { success: false, error: "Invalid journey ID", code: "INVALID_INPUT" };
    }

    await prisma.journey.update({
      where: { id: parsedId.data, userId: session.user.id },
      data: { deletedAt: new Date() },
    });

    revalidatePath("/journeys");
    return { success: true, data: undefined };
  } catch (error) {
    const err = handleServerError(error, "deleteJourney");
    return { success: false, error: getUserFriendlyMessage(err.code), code: err.code, referenceId: err.referenceId };
  }
}

const DiscoveryPlacePersistSchema = z.object({
  id: z.string().min(1),
  category: z.string(),
  title: z.string(),
  description: z.string(),
  highlights: z.array(z.string()),
});

const SaveDiscoveryStateSchema = z.object({
  places: z.array(DiscoveryPlacePersistSchema).optional(),
  journeyPlaceIds: z.array(z.string()).optional(),
  wishlistPlaceIds: z.array(z.string()).optional(),
});

/**
 * Persist Discovery places + selections on Journey.metadata.discovery.
 * Merges with existing metadata (including lastCompletedStep).
 */
export async function saveDiscoveryState(
  journeyId: string,
  patch: z.infer<typeof SaveDiscoveryStateSchema>,
): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };
    }

    const parsedId = IdSchema.safeParse(journeyId);
    if (!parsedId.success) {
      return { success: false, error: "Invalid journey ID", code: "INVALID_INPUT" };
    }

    const parsedPatch = SaveDiscoveryStateSchema.safeParse(patch);
    if (!parsedPatch.success) {
      return { success: false, error: "Invalid discovery payload", code: "VALIDATION_ERROR" };
    }

    const journey = await prisma.journey.findUnique({
      where: {
        id: parsedId.data,
        userId: session.user.id,
        status: { in: ["DRAFT", "GENERATING", "FAILED", "READY"] },
      },
      select: { metadata: true, originQuery: true },
    });

    if (!journey) {
      return { success: false, error: "Journey not found", code: "NOT_FOUND" };
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

    const nextDiscovery = {
      places:
        parsedPatch.data.places !== undefined
          ? parsedPatch.data.places
          : Array.isArray(prevDiscovery.places)
            ? prevDiscovery.places
            : [],
      journeyPlaceIds:
        parsedPatch.data.journeyPlaceIds !== undefined
          ? parsedPatch.data.journeyPlaceIds
          : Array.isArray(prevDiscovery.journeyPlaceIds)
            ? prevDiscovery.journeyPlaceIds
            : [],
      wishlistPlaceIds:
        parsedPatch.data.wishlistPlaceIds !== undefined
          ? parsedPatch.data.wishlistPlaceIds
          : Array.isArray(prevDiscovery.wishlistPlaceIds)
            ? prevDiscovery.wishlistPlaceIds
            : [],
    };

    await prisma.journey.update({
      where: { id: parsedId.data, userId: session.user.id },
      data: {
        metadata: {
          ...prevMeta,
          discovery: nextDiscovery,
        } as Prisma.InputJsonValue,
      },
    });

    // Bridge Discovery wishlist → SavedPlace (Wishlist page + Journey View sync)
    if (parsedPatch.data.wishlistPlaceIds !== undefined) {
      const destination =
        journey.originQuery?.split(",")[0]?.trim() ||
        journey.originQuery ||
        "Unknown destination";

      const placesForSync = (
        Array.isArray(nextDiscovery.places) ? nextDiscovery.places : []
      )
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

      await syncDiscoveryWishlistToSavedPlaces({
        userId: session.user.id,
        journeyId: parsedId.data,
        destination,
        places: placesForSync,
        wishlistPlaceIds: (nextDiscovery.wishlistPlaceIds as unknown[]).filter(
          (id): id is string => typeof id === "string",
        ),
      });
    }

    return { success: true, data: undefined };
  } catch (error) {
    const err = handleServerError(error, "saveDiscoveryState");
    return {
      success: false,
      error: getUserFriendlyMessage(err.code),
      code: err.code,
      referenceId: err.referenceId,
    };
  }
}

/**
 * Persist a journey composed from Discovery selections.
 * Writes day segments as stops, stores full itinerary on metadata.composedJourney,
 * sets status READY, and debits one credit (non-premium).
 */
export async function persistComposedItinerary(
  journeyId: string,
  composed: {
    title: string;
    summary: string;
    notes?: string;
    days: Array<{
      dayNumber: number;
      theme?: string;
      transition: string;
      pacing: string;
      morning: string;
      afternoon: string;
      evening: string;
      notes?: string;
      placeTitles?: string[];
    }>;
  },
  usage?: unknown,
  promptVersion?: string,
): Promise<ActionResponse<Journey>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };
    }

    const parsedId = IdSchema.safeParse(journeyId);
    if (!parsedId.success) {
      return { success: false, error: "Invalid journey ID", code: "INVALID_INPUT" };
    }

    if (!composed.days?.length || !composed.summary?.trim() || !composed.title?.trim()) {
      return {
        success: false,
        error: "Invalid composed itinerary",
        code: "VALIDATION_ERROR",
      };
    }

    const journey = await prisma.journey.findUnique({
      where: { id: parsedId.data, userId: session.user.id },
    });

    if (!journey) {
      return { success: false, error: "Journey not found", code: "NOT_FOUND" };
    }

    // Idempotent: already generated — return existing
    if (journey.status === "READY") {
      const existingStops = await prisma.journeyStop.count({
        where: { journeyId: parsedId.data },
      });
      if (existingStops > 0) {
        return { success: true, data: journey };
      }
    }

    const flatStops: Array<{
      name: string;
      kind: "EXPERIENCE" | "MEAL";
      description: string;
      nights: number;
      dayStart: number;
      dayEnd: number;
      googlePlaceId: null;
      latitude: null;
      longitude: null;
      highlights: string[];
      metadata: Prisma.InputJsonValue;
    }> = [];

    for (const day of composed.days) {
      const dayNumber = day.dayNumber;
      const placeTitles = day.placeTitles ?? [];
      const baseMeta = {
        dayNumber,
        dayTheme: day.theme || "",
        daySummary: day.transition,
        pacing: day.pacing,
        dayNotes: day.notes || "",
        placeTitles,
        composed: true,
      };

      const segments: Array<{
        label: string;
        text: string;
        kind: "EXPERIENCE" | "MEAL";
        segment: string;
      }> = [
        { label: "Morning", text: day.morning, kind: "EXPERIENCE", segment: "morning" },
        { label: "Afternoon", text: day.afternoon, kind: "EXPERIENCE", segment: "afternoon" },
        { label: "Evening", text: day.evening, kind: "MEAL", segment: "evening" },
      ];

      for (const seg of segments) {
        if (!seg.text?.trim()) continue;
        flatStops.push({
          name: seg.label,
          kind: seg.kind,
          description: seg.text,
          nights: 1,
          dayStart: dayNumber,
          dayEnd: dayNumber,
          googlePlaceId: null,
          latitude: null,
          longitude: null,
          highlights: placeTitles.slice(0, 5),
          metadata: {
            ...baseMeta,
            segment: seg.segment,
          },
        });
      }
    }

    if (flatStops.length === 0) {
      return {
        success: false,
        error: "Composed itinerary had no day segments",
        code: "VALIDATION_ERROR",
      };
    }

    const updatedJourney = await prisma.$transaction(async (tx) => {
      await tx.journeyStop.deleteMany({ where: { journeyId: parsedId.data } });

      await tx.journeyStop.createMany({
        data: flatStops.map((stop, index) => ({
          journeyId: parsedId.data,
          order: index + 1,
          name: stop.name,
          description: stop.description,
          latitude: stop.latitude,
          longitude: stop.longitude,
          googlePlaceId: stop.googlePlaceId,
          kind: stop.kind,
          nights: stop.nights,
          dayStart: stop.dayStart,
          dayEnd: stop.dayEnd,
          highlights: stop.highlights,
          metadata: stop.metadata,
        })),
      });

      const currentUser = await tx.user.findUnique({ where: { id: session.user.id } });
      if (currentUser?.plan !== "PREMIUM") {
        const deductionResult = await tx.creditWallet.updateMany({
          where: { userId: session.user.id, balance: { gt: 0 } },
          data: { balance: { decrement: 1 }, lifetimeConsumed: { increment: 1 } },
        });

        if (deductionResult.count === 0) {
          throw new Error("Insufficient AI credits");
        }

        const updatedWallet = await tx.creditWallet.findUnique({
          where: { userId: session.user.id },
        });
        if (updatedWallet) {
          await tx.creditTransaction.create({
            data: {
              walletId: updatedWallet.id,
              userId: session.user.id,
              type: "CONSUMPTION",
              amount: -1,
              balanceAfter: updatedWallet.balance,
              reason: "JOURNEY_GENERATION",
              journeyId: parsedId.data,
            },
          });
        }
      }

      const existingMetadata =
        journey.metadata &&
        typeof journey.metadata === "object" &&
        !Array.isArray(journey.metadata)
          ? (journey.metadata as Prisma.JsonObject)
          : {};

      return tx.journey.update({
        where: { id: parsedId.data },
        data: {
          status: "READY",
          title: composed.title || journey.title,
          summary: composed.summary || journey.summary,
          metadata: {
            ...existingMetadata,
            composedJourney: composed,
            aiSummary: composed.summary,
            aiDurationDays: composed.days.length,
            aiDays: composed.days,
            usage: usage ?? null,
            promptVersion: promptVersion ?? "1.0.0",
            generatedFrom: "discovery",
          } as Prisma.InputJsonValue,
        },
      });
    });

    revalidatePath(`/journeys/${parsedId.data}`);
    revalidatePath(`/journeys/${parsedId.data}/compose`);
    revalidatePath("/journeys");

    return { success: true, data: updatedJourney };
  } catch (error) {
    try {
      await prisma.journey.updateMany({
        where: { id: journeyId, status: "GENERATING" },
        data: { status: "FAILED" },
      });
    } catch {
      // best-effort status flip
    }

    const err = handleServerError(error, "persistComposedItinerary");
    return {
      success: false,
      error: getUserFriendlyMessage(err.code),
      code: err.code,
      referenceId: err.referenceId,
    };
  }
}

/**
 * Persist user edits to an existing composed itinerary.
 * Updates metadata.composedJourney and rebuilds stops. No credit debit.
 */
export async function saveComposedJourneyEdits(
  journeyId: string,
  composedInput: unknown,
): Promise<ActionResponse<Journey>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };
    }

    const parsedId = IdSchema.safeParse(journeyId);
    if (!parsedId.success) {
      return { success: false, error: "Invalid journey ID", code: "INVALID_INPUT" };
    }

    const { ComposedJourneySchema } = await import("@/lib/ai/schemas/composed-journey");
    const { normalizeComposedJourney } = await import("@/lib/utils/composed-journey");

    const parsed = ComposedJourneySchema.safeParse(composedInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid itinerary edits",
        code: "VALIDATION_ERROR",
      };
    }

    const composed = normalizeComposedJourney(parsed.data);

    const journey = await prisma.journey.findUnique({
      where: { id: parsedId.data, userId: session.user.id },
    });

    if (!journey) {
      return { success: false, error: "Journey not found", code: "NOT_FOUND" };
    }

    if (journey.status !== "READY") {
      return {
        success: false,
        error: "Only ready journeys can be edited",
        code: "VALIDATION_ERROR",
      };
    }

    const flatStops: Array<{
      name: string;
      kind: "EXPERIENCE" | "MEAL";
      description: string;
      nights: number;
      dayStart: number;
      dayEnd: number;
      googlePlaceId: null;
      latitude: null;
      longitude: null;
      highlights: string[];
      metadata: Prisma.InputJsonValue;
    }> = [];

    for (const day of composed.days) {
      const dayNumber = day.dayNumber;
      const placeTitles = day.placeTitles ?? day.places?.map((p) => p.title) ?? [];
      const baseMeta = {
        dayNumber,
        dayTheme: day.theme || "",
        daySummary: day.transition,
        pacing: day.pacing,
        dayNotes: day.notes || "",
        placeTitles,
        places: day.places ?? [],
        composed: true,
      };

      const segments: Array<{
        label: string;
        text: string;
        kind: "EXPERIENCE" | "MEAL";
        segment: string;
      }> = [
        { label: "Morning", text: day.morning, kind: "EXPERIENCE", segment: "morning" },
        { label: "Afternoon", text: day.afternoon, kind: "EXPERIENCE", segment: "afternoon" },
        { label: "Evening", text: day.evening, kind: "MEAL", segment: "evening" },
      ];

      for (const seg of segments) {
        if (!seg.text?.trim()) continue;
        flatStops.push({
          name: seg.label,
          kind: seg.kind,
          description: seg.text,
          nights: 1,
          dayStart: dayNumber,
          dayEnd: dayNumber,
          googlePlaceId: null,
          latitude: null,
          longitude: null,
          highlights: placeTitles.slice(0, 5),
          metadata: { ...baseMeta, segment: seg.segment },
        });
      }
    }

    const updatedJourney = await prisma.$transaction(async (tx) => {
      await tx.journeyStop.deleteMany({ where: { journeyId: parsedId.data } });

      if (flatStops.length > 0) {
        await tx.journeyStop.createMany({
          data: flatStops.map((stop, index) => ({
            journeyId: parsedId.data,
            order: index + 1,
            name: stop.name,
            description: stop.description,
            latitude: stop.latitude,
            longitude: stop.longitude,
            googlePlaceId: stop.googlePlaceId,
            kind: stop.kind,
            nights: stop.nights,
            dayStart: stop.dayStart,
            dayEnd: stop.dayEnd,
            highlights: stop.highlights,
            metadata: stop.metadata,
          })),
        });
      }

      const existingMetadata =
        journey.metadata &&
        typeof journey.metadata === "object" &&
        !Array.isArray(journey.metadata)
          ? (journey.metadata as Prisma.JsonObject)
          : {};

      return tx.journey.update({
        where: { id: parsedId.data },
        data: {
          title: composed.title || journey.title,
          summary: composed.summary || journey.summary,
          metadata: {
            ...existingMetadata,
            composedJourney: composed,
            aiSummary: composed.summary,
            aiDurationDays: composed.days.length,
            aiDays: composed.days,
            lastEditedAt: new Date().toISOString(),
          } as Prisma.InputJsonValue,
        },
      });
    });

    revalidatePath(`/journeys/${parsedId.data}`);
    revalidatePath(`/journeys/${parsedId.data}/discover`);
    revalidatePath("/journeys");

    return { success: true, data: updatedJourney };
  } catch (error) {
    const err = handleServerError(error, "saveComposedJourneyEdits");
    return {
      success: false,
      error: getUserFriendlyMessage(err.code),
      code: err.code,
      referenceId: err.referenceId,
    };
  }
}
