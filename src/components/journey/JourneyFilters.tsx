"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { formStyles } from "@/lib/design";

export function JourneyFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams);
    const value = e.target.value;

    // READY is the default list (no query param).
    if (!value || value === "READY") {
      params.delete("status");
    } else {
      params.set("status", value);
    }

    params.delete("page"); // Reset pagination
    replace(`${pathname}?${params.toString()}`);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams);
    const value = e.target.value;
    
    if (value && value !== "newest") {
      params.set("sort", value);
    } else {
      params.delete("sort"); // "newest" is the default
    }
    
    params.delete("page"); // Reset pagination
    replace(`${pathname}?${params.toString()}`);
  };

  const currentStatus = searchParams.get("status") || "READY";
  const currentSort = searchParams.get("sort") || "newest";

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
      <div className="relative w-full sm:w-auto">
        <select
          value={currentStatus}
          onChange={handleStatusChange}
          className={`${formStyles.input} appearance-none pr-10 py-2 sm:min-w-[140px] cursor-pointer`}
          aria-label="Filter by status"
        >
          <option value="READY">Ready</option>
          <option value="COMPLETED">Completed</option>
          <option value="ARCHIVED">Archived</option>
          <option value="ALL">All Statuses</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
          <svg className="h-4 w-4 text-brand-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <div className="relative w-full sm:w-auto">
        <select
          value={currentSort}
          onChange={handleSortChange}
          className={`${formStyles.input} appearance-none pr-10 py-2 sm:min-w-[160px] cursor-pointer`}
          aria-label="Sort journeys"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="updated">Recently updated</option>
          <option value="alphabetical">Alphabetical</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
          <svg className="h-4 w-4 text-brand-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
