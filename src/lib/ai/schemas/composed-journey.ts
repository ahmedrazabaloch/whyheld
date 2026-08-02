import { z } from "zod";

/** A Discovery place slot assigned to a day — editable and lockable. */
export const ComposedPlaceSlotSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  locked: z.boolean().default(false),
});

/** One day in a journey composed from Discovery selections. */
export const ComposedDaySchema = z.object({
  dayNumber: z.number().int().min(1),
  theme: z.string().optional(),
  /** Short editorial transition into the day. */
  transition: z.string(),
  /** Recommended pacing for the day. */
  pacing: z.string(),
  morning: z.string(),
  afternoon: z.string(),
  evening: z.string(),
  notes: z.string().optional(),
  /** Titles of selected Discovery places woven into this day (legacy + display). */
  placeTitles: z.array(z.string()).default([]),
  /** Structured place slots for editing / locking. */
  places: z.array(ComposedPlaceSlotSchema).default([]),
});

export const ComposedJourneySchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  notes: z.string().optional(),
  days: z.array(ComposedDaySchema).min(1),
});

/** Single-day rewrite for Regenerate Day. */
export const RegeneratedDaySchema = ComposedDaySchema;

export type ComposedPlaceSlot = z.infer<typeof ComposedPlaceSlotSchema>;
export type ComposedDay = z.infer<typeof ComposedDaySchema>;
export type ComposedJourney = z.infer<typeof ComposedJourneySchema>;
export type RegeneratedDay = z.infer<typeof RegeneratedDaySchema>;
