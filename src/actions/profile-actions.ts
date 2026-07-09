"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { resolvePlaceDetails, resolveReverseGeocode } from "@/lib/location/service";

import { type ActionResponse, handleServerError, getUserFriendlyMessage } from "@/lib/utils/errors";

export async function updateProfileLocation(
  payload: { placeId: string } | { lat: number; lng: number }
): Promise<ActionResponse<{ label: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };
    }

    const userId = session.user.id;

    let locationData;
    if ("placeId" in payload) {
      locationData = await resolvePlaceDetails(payload.placeId);
    } else {
      locationData = await resolveReverseGeocode(payload.lat, payload.lng);
    }

    if (!locationData) {
      return { success: false, error: "Failed to resolve location", code: "PROVIDER_ERROR" };
    }

    await prisma.profile.update({
      where: { userId },
      data: {
        city: locationData.city,
        state: locationData.state,
        country: locationData.country,
        countryCode: locationData.countryCode,
        formattedAddress: locationData.formattedAddress,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        locationPlaceId: locationData.placeId,
        locationUpdatedAt: new Date(),
      },
    });

    revalidatePath("/profile");
    revalidatePath("/settings");
    
    // Construct a sensible label to return to the UI immediately
    const labelParts = [];
    if (locationData.city) labelParts.push(locationData.city);
    if (locationData.state) labelParts.push(locationData.state);
    
    const label = labelParts.length > 0 
      ? labelParts.join(", ") 
      : (locationData.country || "Location detected");

    return { success: true, data: { label } };
  } catch (error) {
    const err = handleServerError(error, "updateProfileLocation");
    return { success: false, error: getUserFriendlyMessage(err.code), code: err.code, referenceId: err.referenceId };
  }
}
