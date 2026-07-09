"use client";

import { useState } from "react";
import { buttonStyles } from "@/lib/design";

interface LocationDetectProps {
  onLocationFound: (lat: number, lng: number) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function LocationDetect({ onLocationFound, onError, className = "" }: LocationDetectProps) {
  const [isDetecting, setIsDetecting] = useState(false);

  const handleDetect = () => {
    if (!navigator.geolocation) {
      onError?.("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetecting(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsDetecting(false);
        onLocationFound(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        setIsDetecting(false);
        let errorMsg = "Unable to retrieve your location.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "Location permission was denied.";
        }
        onError?.(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <button
      type="button"
      onClick={handleDetect}
      disabled={isDetecting}
      className={`${buttonStyles.secondary} w-full text-sm ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 11 22 2 13 21 11 13 3 11" />
      </svg>
      {isDetecting ? "Detecting..." : "Use my current location"}
    </button>
  );
}
