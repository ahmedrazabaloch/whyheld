"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { formStyles } from "@/lib/design";
import type { AutocompletePrediction } from "@/lib/location/types";

interface LocationAutocompleteProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (placeId: string, description: string) => void;
  error?: string;
  className?: string;
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
}: LocationAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [predictions, setPredictions] = useState<AutocompletePrediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sessionTokenRef = useRef<string | null>(null);

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
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
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

  return (
    <div className={`relative flex flex-col gap-2 ${className}`} ref={wrapperRef}>
      {label && <label className={formStyles.label}>{label}</label>}
      <div className="relative">
        <input
          type="text"
          className={formStyles.input}
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-border border-t-brand-btn-primary" />
          </div>
        )}
      </div>
      
      {isOpen && predictions.length > 0 && (
        <ul className="absolute top-full z-10 mt-2 w-full overflow-hidden rounded-2xl border border-brand-border bg-brand-card shadow-panel">
          {predictions.map((p) => (
            <li key={p.placeId}>
              <button
                type="button"
                className="w-full px-4 py-3 text-left transition-colors hover:bg-brand-text-primary/5 focus:bg-brand-text-primary/5 focus:outline-none"
                onClick={() => handleSelect(p.placeId, p.description)}
              >
                <div className="text-sm font-medium text-brand-text-primary">
                  {p.mainText}
                </div>
                {p.secondaryText && (
                  <div className="text-xs text-brand-text-secondary">
                    {p.secondaryText}
                  </div>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className={formStyles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
