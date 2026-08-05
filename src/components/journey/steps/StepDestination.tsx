"use client";

import Image from "next/image";
import { LocationAutocomplete } from "@/components/location/LocationAutocomplete";
import { formStyles } from "@/lib/design";
import type { useJourneyBuilder } from "@/hooks/useJourneyBuilder";

/** World-famous destinations popular with US travelers — chips fill the field. */
const POPULAR_DESTINATIONS = [
  {
    id: "paris",
    label: "Paris, France",
    query: "Paris, France",
    image: "/images/travel-assets/09_italian_village.jpg",
    alt: "European streets inspired by Paris, France",
  },
  {
    id: "tokyo",
    label: "Tokyo, Japan",
    query: "Tokyo, Japan",
    image: "/images/travel-assets/10_local_market.jpg",
    alt: "Busy market atmosphere inspired by Tokyo, Japan",
  },
  {
    id: "rome",
    label: "Rome, Italy",
    query: "Rome, Italy",
    image: "/images/travel-assets/08_bookstore.jpg",
    alt: "Historic European atmosphere inspired by Rome, Italy",
  },
  {
    id: "london",
    label: "London, England",
    query: "London, England",
    image: "/images/travel-assets/13_foggy_harbour.jpg",
    alt: "Foggy harbour mood inspired by London, England",
  },
  {
    id: "santorini",
    label: "Santorini, Greece",
    query: "Santorini, Greece",
    image: "/images/journeys/journey-1.webp",
    alt: "Coastal view inspired by Santorini, Greece",
  },
  {
    id: "barcelona",
    label: "Barcelona, Spain",
    query: "Barcelona, Spain",
    image: "/images/travel-assets/02_bicycle.jpg",
    alt: "City cycling mood inspired by Barcelona, Spain",
  },
  {
    id: "kyoto",
    label: "Kyoto, Japan",
    query: "Kyoto, Japan",
    image: "/images/travel-assets/06_forest_stairs.jpg",
    alt: "Forest path in Kyoto, Japan",
  },
  {
    id: "tuscany",
    label: "Tuscany, Italy",
    query: "Tuscany, Italy",
    image: "/images/travel-assets/12_tuscan_alley.jpg",
    alt: "Tuscan village street in Italy",
  },
  {
    id: "iceland",
    label: "Iceland",
    query: "Iceland",
    image: "/images/travel-assets/04_mountain_lake.jpg",
    alt: "Mountain lake landscape in Iceland",
  },
  {
    id: "bali",
    label: "Bali, Indonesia",
    query: "Bali, Indonesia",
    image: "/images/travel-assets/11_forest_trail.jpg",
    alt: "Lush trail in Bali, Indonesia",
  },
  {
    id: "swiss-alps",
    label: "Swiss Alps",
    query: "Swiss Alps, Switzerland",
    image: "/images/travel-assets/01_paragliding.jpg",
    alt: "Alpine mountains inspired by the Swiss Alps",
  },
  {
    id: "scotland",
    label: "Scottish Highlands",
    query: "Scottish Highlands",
    image: "/images/travel-assets/05_scotland_cliffs.jpg",
    alt: "Coastal cliffs in the Scottish Highlands",
  },
  {
    id: "dubai",
    label: "Dubai, UAE",
    query: "Dubai, United Arab Emirates",
    image: "/images/travel-assets/07_desert_hiker.jpg",
    alt: "Desert landscape inspired by Dubai, UAE",
  },
  {
    id: "new-york",
    label: "New York City",
    query: "New York City, USA",
    image: "/images/travel-assets/03_roadtrip.jpg",
    alt: "Urban journey mood inspired by New York City",
  },
  {
    id: "machu-picchu",
    label: "Machu Picchu, Peru",
    query: "Machu Picchu, Peru",
    image: "/images/travel-assets/14_misty_forest.jpg",
    alt: "Misty mountain landscape inspired by Machu Picchu",
  },
] as const;

export function StepDestination({
  controller,
}: {
  controller: ReturnType<typeof useJourneyBuilder>;
}) {
  const { data, update } = controller;
  const current = (data.originQuery || "").trim().toLowerCase();

  const applyDestination = (desc: string) => {
    update("originQuery", desc);
    if (data.title === "Untitled Journey") {
      update("title", `Journey to ${desc.split(",")[0]}`);
    }
  };

  return (
    <section
      id="setup-destination"
      className="space-y-6"
      aria-labelledby="setup-destination-title"
    >
      <h2
        id="setup-destination-title"
        className="font-display text-2xl font-light tracking-tight text-brand-text-primary sm:text-[1.75rem]"
      >
        Where are you feeling called?
      </h2>

      <div className="space-y-3">
        <LocationAutocomplete
          label="Destination"
          placeholder="e.g. Kyoto, Japan or The Scottish Highlands"
          value={data.originQuery || ""}
          showSearchIcon
          inputClassName="rounded-full"
          onChange={(_placeId, desc) => applyDestination(desc)}
        />

        <p className="max-w-lg text-sm leading-relaxed text-brand-text-secondary">
          Start with a place that&apos;s been on your mind. The rest can unfold
          from there.
        </p>

        <p className="flex items-center gap-3 text-[0.8rem] italic leading-relaxed text-brand-text-secondary/70">
          <span className="h-px w-5 shrink-0 bg-brand-border" aria-hidden />
          <span>Every place has its own rhythm.</span>
        </p>
      </div>

      <div className="space-y-3 pt-1">
        <p className={formStyles.label}>Popular right now</p>
        <div
          className="flex flex-wrap gap-2.5"
          role="list"
          aria-label="Popular destinations"
        >
          {POPULAR_DESTINATIONS.map((place) => {
            const selected =
              current === place.query.toLowerCase() ||
              current === place.label.toLowerCase();

            return (
              <button
                key={place.id}
                type="button"
                role="listitem"
                onClick={() => applyDestination(place.query)}
                aria-pressed={selected}
                className={[
                  "inline-flex max-w-full items-center gap-2.5 rounded-full border py-1.5 pl-1.5 pr-3.5 text-left transition-all duration-200",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary",
                  selected
                    ? "border-brand-btn-primary bg-brand-btn-primary/10 text-brand-text-primary shadow-sm"
                    : "border-brand-border/80 bg-brand-bg/50 text-brand-text-secondary hover:border-brand-btn-primary/50 hover:bg-brand-bg hover:text-brand-text-primary",
                ].join(" ")}
              >
                <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full ring-1 ring-black/5">
                  <Image
                    src={place.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="28px"
                  />
                </span>
                <span className="truncate text-[0.8125rem] font-medium tracking-wide">
                  {place.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
