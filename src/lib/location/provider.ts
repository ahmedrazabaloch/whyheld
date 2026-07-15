import { googleLocationProvider } from "./google";
import type { LocationProvider } from "./types";

/**
 * The abstraction layer for location services.
 * Now exclusively uses the Google Maps provider for all location queries.
 */
export const activeProvider: LocationProvider = googleLocationProvider;

// Export the interface methods directly for seamless integration in the service layer
export const {
  fetchPlacesAutocomplete,
  fetchPlaceDetails,
  fetchReverseGeocode
} = activeProvider;
