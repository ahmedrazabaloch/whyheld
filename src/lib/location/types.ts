export interface WayheldLocation {
  city: string | null;
  state: string | null;
  country: string | null;
  countryCode: string | null;
  formattedAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  placeId: string | null;
}

export interface AutocompletePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

// -----------------------------------------------------------------------------
// Provider Interfaces
// -----------------------------------------------------------------------------

export interface GoogleAutocompleteResponse {
  suggestions?: {
    placePrediction: {
      placeId: string;
      text?: { text: string };
      structuredFormat?: {
        mainText?: { text: string };
        secondaryText?: { text: string };
      };
    };
  }[];
}

export interface GooglePlaceDetailsResponse {
  id?: string;
  formattedAddress?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  addressComponents?: {
    types?: string[];
    longText?: string;
    shortText?: string;
  }[];
}

export interface GoogleGeocodeResponse {
  results?: {
    place_id?: string;
    formatted_address?: string;
    geometry?: {
      location?: {
        lat: number;
        lng: number;
      };
    };
    address_components?: {
      types?: string[];
      long_name?: string;
      short_name?: string;
    }[];
  }[];
}

export interface LocationProvider {
  fetchPlacesAutocomplete(query: string, sessionToken?: string): Promise<GoogleAutocompleteResponse>;
  fetchPlaceDetails(placeId: string, sessionToken?: string): Promise<GooglePlaceDetailsResponse>;
  fetchReverseGeocode(lat: number, lng: number): Promise<GoogleGeocodeResponse>;
}
