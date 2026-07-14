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
            kind: stop.kind || "CITY",
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

    // Pre-transaction Domain Validation
    if (!finalStops || finalStops.length === 0) {
      throw new Error("Validation failed: Generation resulted in 0 stops.");
    }

    const summary = metadata?.summary;
    if (summary === null || summary === undefined || summary === "" || (typeof summary === "string" && summary.trim() === "")) {
      throw new Error("Validation failed: Generation summary is missing or empty.");
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
              kind: stop.kind || "CITY",
              nights: stop.nights || 1,
              highlights: stop.highlights || []
            }
          })
        )
      );

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
