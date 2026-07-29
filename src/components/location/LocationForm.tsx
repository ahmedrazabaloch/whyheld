"use client";

import { useState } from "react";
import { toast } from "sonner";
import { LocationAutocomplete } from "./LocationAutocomplete";
import { LocationDetect } from "./LocationDetect";
import { updateProfileLocation } from "@/actions/profile-actions";

export function LocationForm({ initialLocation = "", label = "Location" }: { initialLocation?: string; label?: string }) {
  // Tracks the label displayed in the autocomplete input after a successful save
  const [savedLabel, setSavedLabel] = useState(initialLocation);
  const [isSaving, setIsSaving] = useState(false);

  const handlePlaceSelect = async (placeId: string, description: string) => {
    if (isSaving) return;
    setIsSaving(true);
    const res = await updateProfileLocation({ placeId });
    setIsSaving(false);
    if (res.success) {
      setSavedLabel(description);
      toast.success("Location updated.");
    } else {
      toast.error(res.error || "Failed to update location.");
    }
  };

  const handleLocationFound = async (lat: number, lng: number) => {
    if (isSaving) return;
    setIsSaving(true);
    const res = await updateProfileLocation({ lat, lng });
    setIsSaving(false);
    if (res.success) {
      // The backend resolved an address — reflect in the input label
      setSavedLabel(res.data?.label ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      toast.success("Location detected and saved.");
    } else {
      toast.error(res.error || "Failed to resolve your location.");
    }
  };

  const handleGeolocationError = (error: string) => {
    toast.error(error);
  };

  return (
    <div className="space-y-3">
      <LocationAutocomplete
        label={label}
        placeholder="Search for a city..."
        value={savedLabel}
        onChange={handlePlaceSelect}
      />
      <LocationDetect onLocationFound={handleLocationFound} onError={handleGeolocationError} />
    </div>
  );
}

