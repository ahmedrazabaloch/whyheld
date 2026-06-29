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
    name: "East Coast Scotland",
    region: "Fife & Aberdeenshire, UK",
    duration: "7 Days",
    style: "Quiet Villages",
    summary:
      "Harbour mornings and empty cliffs, where the North Sea light belongs only to you.",
    highlights: ["Coastal heritage", "Low footfall", "Rail-reachable"],
    image: "/images/journeys/journey-1.webp",
    alt: "Rugged cliffs meeting the North Sea on the east coast of Scotland",
  },
  {
    id: "kyoto",
    name: "Kyoto Heritage Route",
    region: "Kansai, Japan",
    duration: "9 Days",
    style: "Ritual & Craft",
    summary:
      "Cedar forests, tea houses and temple paths walked at the pace of breath.",
    highlights: ["Heritage-rich", "Walkable", "Crowd-free corners"],
    image: "/images/journeys/journey-2.webp",
    alt: "Misty temple pathway lined with maple trees in Kyoto",
  },
  {
    id: "patagonia",
    name: "Patagonia Slow Journey",
    region: "Aysén, Chile & Argentina",
    duration: "12 Days",
    style: "Lakes & Mountains",
    summary:
      "Hanging glaciers, marble caves and the deep quiet that only long stays reveal.",
    highlights: ["Long stays", "Regenerative lodges", "Local guides"],
    image: "/images/journeys/journey-3.webp",
    alt: "Granite peaks reflected in a still lake in Patagonia",
  },
  {
    id: "kerala",
    name: "Kerala Backwaters",
    region: "South India",
    duration: "8 Days",
    style: "Water & Spice",
    summary:
      "Dawn paddles through narrow canals and kitchens that open their doors to you.",
    highlights: ["Community homestays", "Slow mornings", "Plastic-free"],
    image: "/images/journeys/journey-4.webp",
    alt: "Traditional houseboat gliding through the Kerala backwaters at dusk",
  },
];


