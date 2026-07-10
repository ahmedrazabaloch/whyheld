"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { resolvePlaceDetails, resolveReverseGeocode, formatLocation } from "@/lib/location/service";

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

    const latitude = locationData?.latitude ?? ("lat" in payload ? payload.lat : null);
    const longitude = locationData?.longitude ?? ("lng" in payload ? payload.lng : null);

    if (!locationData && latitude == null) {
      return { success: false, error: "Failed to resolve location", code: "PROVIDER_ERROR" };
    }

    await prisma.profile.update({
      where: { userId },
      data: {
        city: locationData?.city ?? null,
        state: locationData?.state ?? null,
        country: locationData?.country ?? null,
        countryCode: locationData?.countryCode ?? null,
        formattedAddress: locationData?.formattedAddress ?? null,
        latitude,
        longitude,
        locationPlaceId: locationData?.placeId ?? null,
        locationUpdatedAt: new Date(),
      },
    });

    revalidatePath("/profile");
    revalidatePath("/settings");
    
    const label = formatLocation({
      city: locationData?.city,
      state: locationData?.state,
      country: locationData?.country,
      latitude,
      longitude,
    }) || "Location detected";

    return { success: true, data: { label } };
  } catch (error) {
    const err = handleServerError(error, "updateProfileLocation");
    return { success: false, error: getUserFriendlyMessage(err.code), code: err.code, referenceId: err.referenceId };
  }
}
