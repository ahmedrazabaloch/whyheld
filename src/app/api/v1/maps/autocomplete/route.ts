import { NextResponse } from "next/server";
import { handleServerError, getUserFriendlyMessage } from "@/lib/utils/errors";
import { autocompletePlaces } from "@/lib/location/service";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const { success } = rateLimit(`autocomplete:${ip}`, { limit: 100, windowMs: 60000 });
  if (!success) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again later.", code: "RATE_LIMITED" },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const sessionToken = searchParams.get("sessionToken") || undefined;

  if (!q) {
    return NextResponse.json({ success: false, error: "Query parameter 'q' is required", code: "INVALID_INPUT" }, { status: 400 });
  }

  try {
    const predictions = await autocompletePlaces(q, sessionToken);
    return NextResponse.json({ success: true, data: predictions });
  } catch (error) {
    const err = handleServerError(error, "autocompletePlaces API");
    return NextResponse.json({ success: false, error: getUserFriendlyMessage(err.code), code: err.code, referenceId: err.referenceId }, { status: 500 });
  }
}
