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
