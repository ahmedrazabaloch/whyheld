import { z } from "zod";

const sanitizeString = (val: unknown) => {
  if (typeof val !== "string") return null;
  const trimmed = val.trim();
  return trimmed === "" ? null : trimmed;
};

const countryCodeSchema = z
  .string()
  .length(2, "Country code must be exactly 2 characters")
  .regex(/^[A-Z]{2}$/, "Country code must be uppercase letters")
  .nullable();

const coordSchema = (min: number, max: number) =>
  z.number().min(min).max(max).nullable();

export const wayheldLocationSchema = z.object({
  city: z.preprocess(sanitizeString, z.string().nullable()),
  state: z.preprocess(sanitizeString, z.string().nullable()),
  country: z.preprocess(sanitizeString, z.string().nullable()),
  countryCode: countryCodeSchema,
  formattedAddress: z.preprocess(sanitizeString, z.string().nullable()),
  latitude: coordSchema(-90, 90),
  longitude: coordSchema(-180, 180),
  placeId: z.preprocess(sanitizeString, z.string().nullable()),
});
