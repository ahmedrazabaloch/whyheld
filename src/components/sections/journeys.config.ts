export interface Journey {
  id: string;
  name: string;
  region: string;
  /** Duration label, e.g. "7 Days" */
  duration: string;
  /** Travel style, e.g. "Quiet Villages" */
  style: string;
  /** Emotional one-line summary */
  summary: string;
  /** Key highlight chips */
  highlights: string[];
  image: string;
  alt: string;
}

export const JOURNEYS_KICKER = "Featured journeys";

export const JOURNEYS_HEADLINE = {
  lead: "Routes worth",
  accent: "slowing down",
  tail: " for.",
};

export const JOURNEYS_INTRO =
  "A handful of journeys shaped by Wayheld — each one chosen for depth over distance, and the quiet over the queue.";

/**
 * Featured journeys. Images reuse the showcase assets (with the same runtime
 * fallback via ResilientImage), so nothing renders empty.
 */
export const JOURNEYS: Journey[] = [
  {
    id: "scotland",
    name: "Hidden Coastal Village",
    region: "Fife & Aberdeenshire, UK",
    duration: "7 Days",
    style: "Quiet Villages",
    summary:
      "Harbour mornings move at the pace of fishing boats instead of tour groups.",
    highlights: ["Coastal heritage", "Low footfall", "Rail-reachable"],
    image: "/images/travel-assets/09_italian_village.jpg",
    alt: "Hidden coastal village with quiet harbour mornings",
  },
  {
    id: "kyoto",
    name: "Forest Heritage Walk",
    region: "Kansai, Japan",
    duration: "9 Days",
    style: "Ritual & Craft",
    summary:
      "Walk woodland paths where silence becomes part of the journey.",
    highlights: ["Heritage-rich", "Walkable", "Crowd-free corners"],
    image: "/images/travel-assets/11_forest_trail.jpg",
    alt: "Forest path walked in absolute quiet",
  },
  {
    id: "patagonia",
    name: "Mountain Silence",
    region: "Aysén, Chile & Argentina",
    duration: "12 Days",
    style: "Lakes & Mountains",
    summary:
      "Spend quiet mornings by the water before the valley fully wakes.",
    highlights: ["Long stays", "Regenerative lodges", "Local guides"],
    image: "/images/travel-assets/04_mountain_lake.jpg",
    alt: "Quiet mountain lake far from the crowds",
  },
  {
    id: "kerala",
    name: "Slow Roads",
    region: "South India",
    duration: "8 Days",
    style: "Water & Spice",
    summary:
      "Stay long enough to discover cafés, conversations and everyday rituals.",
    highlights: ["Community homestays", "Slow mornings", "Plastic-free"],
    image: "/images/travel-assets/03_roadtrip.jpg",
    alt: "Road trip journey on slow roads",
  },
];


