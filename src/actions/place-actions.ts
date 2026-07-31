"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import type { SavedPlaceKind } from "@prisma/client";
import {
  type ActionResponse,
  handleServerError,
} from "@/lib/utils/errors";

const SavePlaceInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  kind: z.string().optional(),
  googlePlaceId: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  note: z.string().optional(),
});

export type SavePlaceInput = z.infer<typeof SavePlaceInputSchema>;

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
    case "CITY":
    case "TOWN":
    case "VILLAGE":
    case "NATURE":
    case "TRANSIT":
    default:
      return "DESTINATION";
  }
}

export async function saveStopAsPlace(
  rawInput: SavePlaceInput
): Promise<ActionResponse<{ id: string; saved: boolean }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };
    }

    const userId = session.user.id;
    const input = SavePlaceInputSchema.parse(rawInput);
    const placeKind = mapToSavedPlaceKind(input.kind);

    // Deduplicate by googlePlaceId for the user when present
    if (input.googlePlaceId) {
      const existing = await prisma.savedPlace.findUnique({
        where: {
          userId_googlePlaceId: {
            userId,
            googlePlaceId: input.googlePlaceId,
          },
        },
      });

      if (existing) {
        return { success: true, data: { id: existing.id, saved: true } };
      }
    }

    const savedPlace = await prisma.savedPlace.create({
      data: {
        userId,
        name: input.name,
        kind: placeKind,
        note: input.description || input.note || null,
        googlePlaceId: input.googlePlaceId || null,
        latitude: input.latitude || null,
        longitude: input.longitude || null,
      },
    });

    // Log UserActivity
    await prisma.userActivity.create({
      data: {
        userId,
        type: "PLACE_SAVED",
        targetType: "SavedPlace",
        targetId: savedPlace.id,
        metadata: {
          name: savedPlace.name,
          kind: savedPlace.kind,
          googlePlaceId: savedPlace.googlePlaceId,
        },
      },
    });

    revalidatePath("/saved");

    return { success: true, data: { id: savedPlace.id, saved: true } };
  } catch (error) {
    const appError = handleServerError(error, "saveStopAsPlace");
    return {
      success: false,
      error: appError.message,
      code: appError.code,
    };
  }
}

export async function removeSavedPlace(
  id: string
): Promise<ActionResponse<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };
    }

    await prisma.savedPlace.deleteMany({
      where: {
        id,
        userId: session.user.id,
      },
    });

    revalidatePath("/saved");
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
