import locationsData from "./data/locations.json";
import type {
  LocationProvider,
  GoogleAutocompleteResponse,
  GooglePlaceDetailsResponse,
  GoogleGeocodeResponse,
} from "./types";

// The imported JSON matches the exact GooglePlaceDetailsResponse schema.
const dataset = locationsData as GooglePlaceDetailsResponse[];

export const mockLocationProvider: LocationProvider = {
  async fetchPlacesAutocomplete(query: string, sessionToken?: string): Promise<GoogleAutocompleteResponse> {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) {
      return { suggestions: [] };
    }

    const matches = dataset.filter((loc) => {
      const address = loc.formattedAddress?.toLowerCase() || "";
      // Also check individual components (e.g. searching "Jap" matches "Japan")
      const componentMatch = loc.addressComponents?.some((comp) =>
        comp.longText?.toLowerCase().includes(normalizedQuery)
      );
      return address.includes(normalizedQuery) || componentMatch;
    });

    const suggestions = matches.map((loc) => {
      // Try to extract city and country for main/secondary text
      let city = "";
      let country = "";
      for (const comp of loc.addressComponents || []) {
        if (comp.types?.includes("locality")) {
          city = comp.longText || "";
        }
        if (comp.types?.includes("country")) {
          country = comp.longText || "";
        }
      }

      // If city isn't found (e.g., small village without locality type), fallback to first component
      if (!city && loc.addressComponents?.[0]) {
        city = loc.addressComponents[0].longText || "";
      }

      return {
        placePrediction: {
          placeId: loc.id || "",
          text: { text: loc.formattedAddress || "" },
          structuredFormat: {
            mainText: { text: city },
            secondaryText: { text: country },
          },
        },
      };
    });

    return { suggestions };
  },

  async fetchPlaceDetails(placeId: string, sessionToken?: string): Promise<GooglePlaceDetailsResponse> {
    const place = dataset.find((loc) => loc.id === placeId);
    if (!place) {
      // Return empty or throw, simulating Google returning no result
      throw new Error(`Mock provider: Place ID ${placeId} not found`);
    }
    // The dataset is already perfectly structured for Place Details
    return place;
  },

  async fetchReverseGeocode(lat: number, lng: number): Promise<GoogleGeocodeResponse> {
    if (dataset.length === 0) {
      return { results: [] };
    }

    // Find nearest neighbor using simple Euclidean distance (sufficient for mock)
    let nearest = dataset[0];
    let minDistance = Infinity;

    for (const loc of dataset) {
      if (loc.location?.latitude == null || loc.location?.longitude == null) continue;
      const dLat = loc.location.latitude - lat;
      const dLng = loc.location.longitude - lng;
      const distance = dLat * dLat + dLng * dLng;

      if (distance < minDistance) {
        minDistance = distance;
        nearest = loc;
      }
    }

    // Map the internal structure (which matches Place Details) to the Geocode format
    return {
      results: [
        {
          place_id: nearest.id,
          formatted_address: nearest.formattedAddress,
          geometry: {
            location: {
              lat: nearest.location?.latitude || 0,
              lng: nearest.location?.longitude || 0,
            },
          },
          address_components: nearest.addressComponents?.map((comp) => ({
            types: comp.types,
            long_name: comp.longText,
            short_name: comp.shortText,
          })),
        },
      ],
    };
  },
};
