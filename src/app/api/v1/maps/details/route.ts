import { NextResponse } from "next/server";
import { resolvePlaceDetails } from "@/lib/location/service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get("placeId");
  const sessionToken = searchParams.get("sessionToken") || undefined;

  if (!placeId) {
    return NextResponse.json({ error: "Query parameter 'placeId' is required" }, { status: 400 });
  }

  try {
    const location = await resolvePlaceDetails(placeId, sessionToken);
    if (!location) {
      return NextResponse.json({ error: "Place not found or invalid" }, { status: 404 });
    }
    return NextResponse.json({ location });
  } catch (error) {
    console.error("[Maps API] Details failed:", error);
    return NextResponse.json({ error: "Failed to fetch place details" }, { status: 500 });
  }
}
