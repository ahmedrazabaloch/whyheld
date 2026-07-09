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

// Zod schemas for input validation
const IdSchema = z.string().cuid();

const UpdateDraftSchema = z.object({
  title: z.string().optional(),
  originQuery: z.string().nullable().optional(),
  primaryCountry: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
  startDate: z.date().nullable().optional(),
  endDate: z.date().nullable().optional(),
  durationDays: z.number().nullable().optional(),
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
      orderBy: { createdAt: "desc" }
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

    await prisma.journey.update({
      where: { id: parsedId.data, userId: session.user.id, status: "DRAFT" },
      data: {
        ...fields,
        ...(lastCompletedStep !== undefined
          ? { metadata: { lastCompletedStep } }
          : {}),
      },
    });

    revalidatePath(`/journeys/${parsedId.data}/build`);
    return { success: true, data: undefined };
  } catch (error) {
    const err = handleServerError(error, "updateDraft");
    return { success: false, error: getUserFriendlyMessage(err.code), code: err.code, referenceId: err.referenceId };
  }
}

export async function appendGenerationEvent(journeyId: string, events: AiStreamEvent[]): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };
    }

    // Determine if we need to update the journey status
    const hasConnectingStatus = events.some(
      (e) => e.type === "status" && e.message === "Connecting to AI..."
    );

    if (hasConnectingStatus) {
      await prisma.journey.updateMany({
        where: { id: journeyId, userId: session.user.id, status: { in: ["DRAFT", "FAILED"] } },
        data: { status: "GENERATING" }
      });
    }

    // Filter for day events to persist incrementally
    const dayEvents = events.filter((e) => e.type === "day");
    
    if (dayEvents.length > 0) {
      // Use a transaction to perform idempotent upserts based on day order
      await prisma.$transaction(async (tx) => {
        for (const event of dayEvents) {
          if (event.type !== "day") continue;
          const stop = event.payload;
          const order = event.index + 1; // Assuming event.index is 0-based
          
          // Upsert using the unique constraint on (journeyId, order) if it exists.
          // Since our schema might not have a unique constraint on (journeyId, order), 
          // we use findFirst + update/create to ensure idempotency.
          const existing = await tx.journeyStop.findFirst({
            where: { journeyId, order }
          });

          const data = {
            name: stop.name || `Stop ${order}`,
            description: stop.description || stop.summary || "",
            latitude: stop.latitude || null,
            longitude: stop.longitude || null,
            googlePlaceId: stop.googlePlaceId || null,
            kind: stop.kind || "City",
            nights: stop.nights || 1,
            highlights: stop.highlights || []
          };

          if (existing) {
            await tx.journeyStop.update({
              where: { id: existing.id },
              data
            });
          } else {
            await tx.journeyStop.create({
              data: {
                ...data,
                journeyId,
                order
              }
            });
          }
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

    // Final DB transaction
    const updatedJourney = await prisma.$transaction(async (tx) => {
      // 1. Delete any existing stops (in case of a retry that partially wrote)
      await tx.journeyStop.deleteMany({
        where: { journeyId }
      });

      // 2. Create the new stops
      const createdStops = await Promise.all(
        finalStops.map((stop, index) => 
          tx.journeyStop.create({
            data: {
              journeyId,
              order: index + 1,
              name: stop.name || `Stop ${index + 1}`,
              description: stop.description || stop.summary || "",
              latitude: stop.latitude || null,
              longitude: stop.longitude || null,
              googlePlaceId: stop.googlePlaceId || null,
              kind: stop.kind || "City",
              nights: stop.nights || 1,
              highlights: stop.highlights || []
            }
          })
        )
      );

      // 3. Concurrency-safe atomic credit deduction
      // We read the user's plan. If not PREMIUM, we atomically decrement 1 credit where > 0.
      // The updateMany ensures a concurrent transaction cannot bypass the > 0 check.
      const currentUser = await tx.user.findUnique({ where: { id: session.user.id } });
      if (currentUser?.plan !== "PREMIUM") {
        const deductionResult = await tx.user.updateMany({
          where: { id: session.user.id, credits: { gt: 0 } },
          data: { credits: { decrement: 1 } }
        });
        if (deductionResult.count === 0) {
          throw new Error("Insufficient AI credits");
        }
      }

      // 4. Update the Journey metadata and status
      const existingMetadata = (journey.metadata as Prisma.JsonObject) || {};
      
      const result = await tx.journey.update({
        where: { id: journeyId },
        data: {
          status: "READY",
          title: metadata?.title || journey.title,
          metadata: {
            ...existingMetadata,
            aiSummary: metadata?.summary,
            aiDurationDays: metadata?.durationDays,
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

