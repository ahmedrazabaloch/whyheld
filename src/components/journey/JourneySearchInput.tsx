"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { formStyles } from "@/lib/design";

export function JourneySearchInput() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  const currentQ = searchParams.get("q")?.toString() || "";
  const [query, setQuery] = useState(currentQ);

  // Sync local state if URL changes (e.g., browser back/forward)
  useEffect(() => {
    setQuery(currentQ);
  }, [currentQ]);

  useEffect(() => {
    // If the input perfectly matches the URL, do nothing!
    // This prevents the effect from firing when we navigate, paginate, or sync from URL.
    if (query === currentQ) return;

    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      // Always reset to page 1 on a new search
      params.delete("page");
      
      const newUrl = `${pathname}?${params.toString()}`;
      replace(newUrl);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, currentQ, pathname, replace, searchParams]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <svg
          className="h-4 w-4 text-brand-text-secondary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="search"
        className={`${formStyles.input} pl-10`}
        placeholder="Search journeys..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
}
