import { z } from "zod";

// Shared metadata schema
export const GeneratedMetadataSchema = z.object({
  confidenceScore: z.number().min(0).max(1).optional(),
  curatorNote: z.string().optional(),
});

// Single point of interest / stop
export const StopOutputSchema = z.object({
  name: z.string(),
  kind: z.enum([
    "CITY", "TOWN", "VILLAGE", "NATURE", 
    "HERITAGE_SITE", "STAY", "EXPERIENCE", "TRANSIT", "MEAL"
  ]),
  description: z.string().optional(),
  nights: z.number().int().min(0).optional(),
  dayStart: z.number().int().min(1).optional(),
  dayEnd: z.number().int().min(1).optional(),
  address: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  googlePlaceId: z.string().optional(),
  metadata: GeneratedMetadataSchema.optional(),
});

// A generated day itinerary
export const DayOutputSchema = z.object({
  dayNumber: z.number().int().min(1),
  theme: z.string().optional(),
  summary: z.string(),
  stops: z.array(StopOutputSchema),
});

// The complete journey plan
export const JourneyOutputSchema = z.object({
  title: z.string(),
  summary: z.string(),
  primaryCountry: z.string().optional(),
  region: z.string().optional(),
  stops: z.array(StopOutputSchema),
  metadata: GeneratedMetadataSchema.optional(),
});

// Destination recommendation
export const RecommendationOutputSchema = z.object({
  title: z.string(),
  reason: z.string(),
  region: z.string().optional(),
  country: z.string().optional(),
  score: z.number().min(0).max(10).optional(),
});

export type JourneyOutput = z.infer<typeof JourneyOutputSchema>;
export type StopOutput = z.infer<typeof StopOutputSchema>;
export type DayOutput = z.infer<typeof DayOutputSchema>;
export type RecommendationOutput = z.infer<typeof RecommendationOutputSchema>;
