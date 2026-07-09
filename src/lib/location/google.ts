import { requireGoogleApiKey } from "./env";
import { AppError } from "@/lib/utils/errors";

export async function fetchPlacesAutocomplete(query: string, sessionToken?: string) {
  const apiKey = requireGoogleApiKey();
  const url = "https://places.googleapis.com/v1/places:autocomplete";
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
    },
    body: JSON.stringify({
      input: query,
      sessionToken,
    }),
  });
  
  if (!response.ok) {
    const status = response.status;
    const headers = Object.fromEntries(response.headers.entries());
    const bodyText = await response.text();
    console.error("Google Autocomplete API error details:", {
      status,
      headers,
      body: bodyText
    });
    throw new AppError({
      code: "PROVIDER_ERROR",
      message: "Google Places API failed to resolve autocomplete",
      cause: new Error(`Google Autocomplete API error: ${response.statusText} - ${bodyText}`),
    });
  }
  return response.json();
}

export async function fetchPlaceDetails(placeId: string, sessionToken?: string) {
  const apiKey = requireGoogleApiKey();
  const url = `https://places.googleapis.com/v1/places/${placeId}?fields=id,formattedAddress,location,addressComponents`;
  
  const headers: Record<string, string> = {
    "X-Goog-Api-Key": apiKey,
  };
  
  // New Places API uses field masks in headers or query params. We added it to query param fields=...
  
  const response = await fetch(url, { headers });
  if (!response.ok) {
    const status = response.status;
    const headers = Object.fromEntries(response.headers.entries());
    const bodyText = await response.text();
    console.error("Google Place Details API error details:", {
      status,
      headers,
      body: bodyText
    });
    throw new AppError({
      code: "PROVIDER_ERROR",
      message: "Google Places API failed to resolve place details",
      cause: new Error(`Google Place Details API error: ${response.statusText} - ${bodyText}`),
    });
  }
  return response.json();
}

export async function fetchReverseGeocode(lat: number, lng: number) {
  const apiKey = requireGoogleApiKey();
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new AppError({
      code: "PROVIDER_ERROR",
      message: "Google Reverse Geocode API failed",
      cause: new Error(`Google Reverse Geocode API error: ${response.statusText}`),
    });
  }
  return response.json();
}
