import { googleLocationProvider } from "./google";
import { mockLocationProvider } from "./mock";
import type { LocationProvider } from "./types";

const providerName = process.env.LOCATION_PROVIDER || "google";
const isDevelopment = process.env.NODE_ENV === "development";
const fallbackEnabled = process.env.ENABLE_MOCK_FALLBACK === "true" || isDevelopment;

const createActiveProvider = (): LocationProvider => {
  if (providerName === "mock") {
    console.log("[LocationService] Provider: Mock");
    return mockLocationProvider;
  }

  if (!fallbackEnabled) {
    console.log("[LocationService] Provider: Google");
    return googleLocationProvider;
  }

  console.log("[LocationService] Provider: Google");
  
  return {
    async fetchPlacesAutocomplete(query, sessionToken) {
      try {
        return await googleLocationProvider.fetchPlacesAutocomplete(query, sessionToken);
      } catch (error: any) {
        console.warn(`[LocationService] Provider: Google → Mock Fallback (Autocomplete) - ${error.message}`);
        return mockLocationProvider.fetchPlacesAutocomplete(query, sessionToken);
      }
    },
    async fetchPlaceDetails(placeId, sessionToken) {
      try {
        return await googleLocationProvider.fetchPlaceDetails(placeId, sessionToken);
      } catch (error: any) {
        console.warn(`[LocationService] Provider: Google → Mock Fallback (PlaceDetails) - ${error.message}`);
        return mockLocationProvider.fetchPlaceDetails(placeId, sessionToken);
      }
    },
    async fetchReverseGeocode(lat, lng) {
      try {
        return await googleLocationProvider.fetchReverseGeocode(lat, lng);
      } catch (error: any) {
        console.warn(`[LocationService] Provider: Google → Mock Fallback (ReverseGeocode) - ${error.message}`);
        return mockLocationProvider.fetchReverseGeocode(lat, lng);
      }
    }
  };
};

/**
 * The abstraction layer for location services.
 * Automatically resolves to the Google or Mock provider based on LOCATION_PROVIDER,
 * with graceful degradation to Mock if Google fails in development.
 */
export const activeProvider: LocationProvider = createActiveProvider();

// Export the interface methods directly for seamless integration in the service layer
export const {
  fetchPlacesAutocomplete,
  fetchPlaceDetails,
  fetchReverseGeocode
} = activeProvider;
