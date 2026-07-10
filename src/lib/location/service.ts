import { unstable_cache } from "next/cache";
import { fetchPlaceDetails, fetchPlacesAutocomplete, fetchReverseGeocode } from "./google";
import { parseAutocompletePredictions, parseGeocode, parsePlaceDetails } from "./parser";
import { wayheldLocationSchema } from "./validation";
import type { AutocompletePrediction, WayheldLocation } from "./types";

/**
 * Autocomplete is not cached on the server to prevent massive cache bloat.
 * Debouncing and caching happens on the client side.
 */
export async function autocompletePlaces(query: string, sessionToken?: string): Promise<AutocompletePrediction[]> {
  if (!query || query.trim().length < 2) return [];
  const rawData = await fetchPlacesAutocomplete(query, sessionToken);
  return parseAutocompletePredictions(rawData);
}

/**
 * Resolves a place ID into a validated internal WayheldLocation.
 * Aggressively cached since Place details rarely change.
 * The cache is keyed ONLY by placeId to maximize cache hits.
 */
export async function resolvePlaceDetails(placeId: string, sessionToken?: string): Promise<WayheldLocation | null> {
  const fetchAndCache = unstable_cache(
    async (id: string) => {
      try {
        const rawData = await fetchPlaceDetails(id, sessionToken);
        return wayheldLocationSchema.parse(parsePlaceDetails(rawData));
      } catch (error) {
        console.error("[LocationService] Failed to resolve place details:", error);
        return null;
      }
    },
    ["wayheld-location-details", placeId],
    { revalidate: 86400 }
  );

  return fetchAndCache(placeId);
}

/**
 * Resolves latitude and longitude into a validated internal WayheldLocation.
 * Aggressively cached since reverse geocodes for exact coordinates don't change.
 * The cache is keyed ONLY by coordinates.
 */
export async function resolveReverseGeocode(lat: number, lng: number): Promise<WayheldLocation | null> {
  const fetchAndCache = unstable_cache(
    async (latitude: number, longitude: number) => {
      try {
        const rawData = await fetchReverseGeocode(latitude, longitude);
        return wayheldLocationSchema.parse(parseGeocode(rawData));
      } catch (error) {
        console.error("[LocationService] Failed to resolve reverse geocode:", error);
        return null;
      }
    },
    ["wayheld-location-reverse", `${lat},${lng}`],
    { revalidate: 86400 }
  );

  return fetchAndCache(lat, lng);
}

/**
 * Formats a location object into a human-readable label based on priority:
 * City, State > City, Country > State > Country > Latitude, Longitude > empty string
 */
export function formatLocation(loc: {
  city?: string | null;
  state?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}): string {
  if (loc.city && loc.state) {
    return `${loc.city}, ${loc.state}`;
  }
  if (loc.city && loc.country) {
    return `${loc.city}, ${loc.country}`;
  }
  if (loc.state) {
    return loc.state;
  }
  if (loc.country) {
    return loc.country;
  }
  if (loc.latitude != null && loc.longitude != null) {
    return `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`;
  }
  return "";
}

