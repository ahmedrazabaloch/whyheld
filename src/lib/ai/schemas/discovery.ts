import { z } from "zod";

/** Single discovery place — matches DiscoveryPlaceCard fields. */
export const DiscoveryPlaceOutputSchema = z.object({
  category: z.string().min(1).max(40),
  title: z.string().min(1).max(80),
  description: z.string().min(1).max(600),
  highlights: z.array(z.string().min(1).max(80)).min(1).max(5),
});

export const DiscoveryPlacesOutputSchema = z.object({
  places: z.array(DiscoveryPlaceOutputSchema).min(1).max(10),
});

export type DiscoveryPlaceOutput = z.infer<typeof DiscoveryPlaceOutputSchema>;
export type DiscoveryPlacesOutput = z.infer<typeof DiscoveryPlacesOutputSchema>;
