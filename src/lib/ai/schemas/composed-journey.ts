import { z } from "zod";

/** A Discovery place slot assigned to a day — editable and lockable. */
export const ComposedPlaceSlotSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  locked: z.boolean().default(false),
  /** Optional city / locality for this place. */
  city: z.string().optional(),
});

/** One day in a journey composed from Discovery selections. */
export const ComposedDaySchema = z.object({
  dayNumber: z.number().int().min(1),
  theme: z.string().optional(),
  /** Primary city / area for this day (e.g. AlUla). */
  city: z.string().optional(),
  /** Country or broader destination (e.g. Saudi Arabia). */
  country: z.string().optional(),
  /** Short editorial transition into the day. */
  transition: z.string().default(""),
  /** Recommended pacing for the day. */
  pacing: z.string().default(""),
  /**
   * Preferred single narrative for the day.
   * Legacy journeys may only have morning/afternoon/evening.
   */
  summary: z.string().optional(),
  /** Extra traveler tips as short lines (shown with a leading dash). */
  details: z.array(z.string()).default([]),
  /** Practical local tip. */
  localTips: z.string().optional(),
  /** Seasonal / weather guidance for the travel window. */
  weatherNote: z.string().optional(),
  /** Estimated total driving/transit hours for the day (AI estimate). */
  estimatedDriveHours: z.number().min(0).max(24).optional(),
  /** Computed / AI-assisted ethos signals for the day. */
  ethosFlags: z
    .object({
      tooManyPlaces: z.boolean().optional(),
      longDrive: z.boolean().optional(),
    })
    .optional(),
  /** @deprecated Prefer `summary`. Kept for older saved journeys. */
  morning: z.string().default(""),
  /** @deprecated Prefer `summary`. */
  afternoon: z.string().default(""),
  /** @deprecated Prefer `summary`. */
  evening: z.string().default(""),
  /** Traveler-helpful note only — never system/meta commentary. */
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
