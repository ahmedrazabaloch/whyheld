"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { formStyles } from "@/lib/design";
import type { AutocompletePrediction } from "@/lib/location/types";

interface LocationAutocompleteProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (placeId: string, description: string) => void;
  error?: string;
  className?: string;
  showDetectButton?: boolean;
}

function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function LocationAutocomplete({
  label = "Location",
  placeholder = "Search for a city...",
  value = "",
  onChange,
  error,
  className = "",
  showDetectButton = true,
}: LocationAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [predictions, setPredictions] = useState<AutocompletePrediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const sessionTokenRef = useRef<string | null>(null);

  const handleDetectLocation = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        try {
          const res = await fetch(`/api/v1/maps/reverse?lat=${lat}&lng=${lng}`);
          if (res.ok) {
            const data = await res.json();
            const loc = data.location;
            const labelParts = [loc?.city, loc?.state, loc?.country].filter(Boolean);
            const resolvedLabel =
              labelParts.length > 0
                ? labelParts.join(", ")
                : loc?.formattedAddress || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

            setQuery(resolvedLabel);
            if (onChange) {
              onChange(loc?.placeId || "", resolvedLabel);
            }
            toast.success("Location detected!");
          } else {
            const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            setQuery(fallback);
            if (onChange) onChange("", fallback);
            toast.success("Coordinates detected!");
          }
        } catch {
          const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          setQuery(fallback);
          if (onChange) onChange("", fallback);
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        setIsDetecting(false);
        let errorMsg = "Unable to retrieve location.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "Location permission denied.";
        }
        toast.error(errorMsg);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const getSessionToken = () => {
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = crypto.randomUUID();
    }
    return sessionTokenRef.current;
  };

  useEffect(() => {
    // Only update query if it differs from current state to prevent infinite loops
    setQuery((prev) => (prev !== value ? value : prev));
  }, [value]);

  useEffect(() => {
    return () => {
      sessionTokenRef.current = null; // Reset on unmount
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchPredictions = useMemo(
    () =>
      debounce(async (searchQuery: string, token: string | null) => {
        if (!searchQuery || searchQuery.trim().length < 2) {
          setPredictions([]);
          setIsLoading(false);
          return;
        }

        try {
          // Add basic client side cache to prevent re-fetching exact same string
          const cacheKey = `wayheld_autocomplete_${searchQuery}`;
          const cached = sessionStorage.getItem(cacheKey);
          if (cached) {
            setPredictions(JSON.parse(cached));
            setIsLoading(false);
            return;
          }

          const url = `/api/v1/maps/autocomplete?q=${encodeURIComponent(searchQuery)}${token ? `&sessionToken=${token}` : ""}`;
          const res = await fetch(url);
          const data = await res.json().catch(() => ({ success: false }));

          if (!res.ok || !data.success) {
            // Log internally but never throw — show empty list gracefully
            console.error("Autocomplete fetch failed:", res.status, data?.error);
            setPredictions([]);
            return;
          }

          setPredictions(data.data || []);
          sessionStorage.setItem(cacheKey, JSON.stringify(data.data || []));
        } catch (err) {
          // Network-level failure — log and show empty list
          console.error("Autocomplete network error:", err);
          setPredictions([]);
        } finally {
          setIsLoading(false);
        }
      }, 300),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (!isOpen) setIsOpen(true);
    setIsLoading(true);
    fetchPredictions(val, sessionTokenRef.current);
  };

  const handleSelect = (placeId: string, description: string) => {
    setQuery(description);
    setIsOpen(false);
    sessionTokenRef.current = null; // Reset token after place selection
    if (onChange) {
      onChange(placeId, description);
    }
  };

  const handleFocus = () => {
    setIsOpen(true);
    getSessionToken(); // Generate token when input receives focus
  };

  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        setDropdownStyle({
          position: "absolute",
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, predictions]);

  const dropdown = (
    <ul
      ref={dropdownRef}
      className="z-[9999] mt-2 max-h-64 overflow-y-auto rounded-xl border border-brand-card-border bg-brand-card p-1 shadow-2xl outline-none ring-1 ring-black/5"
      style={dropdownStyle}
    >
      {predictions.map((p) => (
        <li key={p.placeId}>
          <button
            type="button"
            className="w-full cursor-pointer rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-brand-text-primary/5 focus:bg-brand-text-primary/5 focus:outline-none"
            onClick={() => handleSelect(p.placeId, p.description)}
          >
            <div className="text-sm font-medium text-brand-text-primary">
              {p.mainText}
            </div>
            {p.secondaryText && (
              <div className="text-xs text-brand-text-secondary/80 mt-0.5">
                {p.secondaryText}
              </div>
            )}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <div className={`relative flex flex-col gap-2 ${className}`} ref={wrapperRef}>
      {label && <label className={formStyles.label}>{label}</label>}
      <div className="relative">
        <input
          type="text"
          className={`${formStyles.input} pr-11`}
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          autoComplete="off"
        />
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
          {isLoading || isDetecting ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-border border-t-brand-btn-primary" />
          ) : (
            showDetectButton && (
              <button
                type="button"
                onClick={handleDetectLocation}
                title="Detect my current location"
                aria-label="Detect my current location"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-brand-text-secondary/70 transition-colors hover:bg-brand-text-primary/5 hover:text-brand-btn-primary focus:outline-none"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="3 11 22 2 13 21 11 13 3 11" />
                </svg>
              </button>
            )
          )}
        </div>
      </div>

      {isOpen && predictions.length > 0 && typeof document !== "undefined"
        ? createPortal(dropdown, document.body)
        : null}

      {error && (
        <p className={formStyles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
