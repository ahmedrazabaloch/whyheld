import { NextResponse } from "next/server";
import { resolveReverseGeocode } from "@/lib/location/service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");

  if (!latStr || !lngStr) {
    return NextResponse.json({ error: "Query parameters 'lat' and 'lng' are required" }, { status: 400 });
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  try {
    const location = await resolveReverseGeocode(lat, lng);
    if (!location) {
      return NextResponse.json({ error: "Location not found or invalid" }, { status: 404 });
    }
    return NextResponse.json({ location });
  } catch (error) {
    console.error("[Maps API] Reverse geocode failed:", error);
    return NextResponse.json({ error: "Failed to reverse geocode" }, { status: 500 });
  }
}
