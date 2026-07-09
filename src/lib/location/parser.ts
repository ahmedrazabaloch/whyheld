import type { WayheldLocation } from "./types";

export function parsePlaceDetails(data: any): WayheldLocation {
  const components = data.addressComponents || [];
  
  let city = null;
  let state = null;
  let country = null;
  let countryCode = null;

  for (const component of components) {
    const types = component.types || [];
    if (types.includes("locality") || types.includes("postal_town")) {
      city = component.longText;
    }
    if (types.includes("administrative_area_level_1")) {
      state = component.longText;
    }
    if (types.includes("country")) {
      country = component.longText;
      countryCode = component.shortText;
    }
  }

  return {
    city,
    state,
    country,
    countryCode,
    formattedAddress: data.formattedAddress || null,
    latitude: data.location?.latitude ?? null,
    longitude: data.location?.longitude ?? null,
    placeId: data.id || null,
  };
}

export function parseGeocode(data: any): WayheldLocation {
  const results = data.results || [];
  if (results.length === 0) {
    return {
      city: null,
      state: null,
      country: null,
      countryCode: null,
      formattedAddress: null,
      latitude: null,
      longitude: null,
      placeId: null,
    };
  }

  const result = results[0];
  const components = result.address_components || [];
  
  let city = null;
  let state = null;
  let country = null;
  let countryCode = null;

  for (const component of components) {
    const types = component.types || [];
    if (types.includes("locality") || types.includes("postal_town")) {
      city = component.long_name;
    }
    if (types.includes("administrative_area_level_1")) {
      state = component.long_name;
    }
    if (types.includes("country")) {
      country = component.long_name;
      countryCode = component.short_name;
    }
  }

  return {
    city,
    state,
    country,
    countryCode,
    formattedAddress: result.formatted_address || null,
    latitude: result.geometry?.location?.lat ?? null,
    longitude: result.geometry?.location?.lng ?? null,
    placeId: result.place_id || null,
  };
}

export function parseAutocompletePredictions(data: any) {
  const suggestions = data.suggestions || [];
  return suggestions.map((s: any) => {
    const place = s.placePrediction;
    return {
      placeId: place.placeId,
      description: place.text?.text || "",
      mainText: place.structuredFormat?.mainText?.text || "",
      secondaryText: place.structuredFormat?.secondaryText?.text || "",
    };
  });
}
