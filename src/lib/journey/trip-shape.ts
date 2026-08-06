import { z } from "zod";
import { normalizeFeelingIds } from "@/lib/journey/feelings";

export const TripPointSchema = z.object({
  name: z.string().min(1).max(200),
  placeId: z.string().max(200).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const TripShapeSchema = z.object({
  startPoint: TripPointSchema.optional(),
  endPoint: TripPointSchema.optional(),
  mustVisit: z.array(TripPointSchema).max(5).default([]),
});

export type TripPoint = z.infer<typeof TripPointSchema>;
export type TripShape = z.infer<typeof TripShapeSchema>;

export const EMPTY_TRIP_SHAPE: TripShape = {
  mustVisit: [],
};

export function parseTripShape(raw: unknown): TripShape {
  const parsed = TripShapeSchema.safeParse(raw);
  if (!parsed.success) return { ...EMPTY_TRIP_SHAPE };
  return {
    startPoint: parsed.data.startPoint,
    endPoint: parsed.data.endPoint,
    mustVisit: parsed.data.mustVisit ?? [],
  };
}

export function parseFeelings(raw: unknown): string[] {
  return normalizeFeelingIds(raw);
}

export function parseJourneyIntent(raw: unknown): "journey" | "explore" {
  return raw === "explore" ? "explore" : "journey";
}

/** Read builder metadata fields from Journey.metadata. */
export function parseBuilderMeta(metadata: unknown): {
  feelings: string[];
  tripShape: TripShape;
  intent: "journey" | "explore";
  accessExpiresAt: string | null;
} {
  const meta =
    metadata && typeof metadata === "object" && !Array.isArray(metadata)
      ? (metadata as Record<string, unknown>)
      : {};

  return {
    feelings: parseFeelings(meta.feelings),
    tripShape: parseTripShape(meta.tripShape),
    intent: parseJourneyIntent(meta.intent),
    accessExpiresAt:
      typeof meta.accessExpiresAt === "string" ? meta.accessExpiresAt : null,
  };
}
