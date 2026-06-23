import type { Headline, ShowcaseDestination } from "./types";

/**
 * Headline options for the Wayheld hero.
 * The first entry is the active headline; the rest are kept as
 * documented alternatives the team can swap in without touching layout.
 */
export const HEADLINES: Headline[] = [
  { lead: "Travel deeper,", accent: "not faster", tail: "." },
  { lead: "Some places", accent: "stay with you", tail: "." },
  { lead: "The world rewards", accent: "the unhurried", tail: "." },
  { lead: "Arrive slowly.", accent: "Belong", tail: " completely." },
  { lead: "Not every place", accent: "wants to be rushed", tail: "." },
  { lead: "Wander with", accent: "intention", tail: "." },
];

export const ACTIVE_HEADLINE = HEADLINES[0];

export const HERO_KICKER = "AI-guided slow travel";

export const HERO_SUBHEAD =
  "Wayheld is your companion for intentional journeys — pairing AI with local knowledge to help you travel regeneratively, honour heritage and connect with places that deserve your time.";



/** How long each destination stays featured before rotating (ms). */
export const SHOWCASE_INTERVAL = 9000;

/**
 * The unified showcase. Each entry drives the featured stage, the selector
 * thumbnail, the background atmosphere and the AI recommendation in lockstep.
 *
 * Images are royalty-free Unsplash assets served via their CDN; a runtime
 * fallback (see ResilientImage) guarantees no empty card ever renders.
 */
export const SHOWCASE: ShowcaseDestination[] = [
  {
    id: "kyoto",
    name: "Kyoto Heritage Route",
    shortName: "Kyoto",
    region: "Kyoto, Japan",
    theme: "Ritual & craft",
    pace: "9 unhurried days",
    tags: ["9 Days", "Slow Travel", "Local Hosts", "Heritage Route"],
    caption:
      "Tea houses, moss gardens and the discipline of stillness — walked, not rushed.",
    image: "/images/kyoto.jpg",
    alt: "Cinematic golden hour shot of Yasaka Pagoda in Kyoto",
    atmosphere: {
      primary: "rgba(116, 135, 107, 0.20)",
      secondary: "rgba(51, 51, 47, 0.15)",
      accent: "rgba(168, 166, 157, 0.10)",
    },
    insight: {
      query: "Kyoto without the spring crowds",
      response:
        "Kyoto in cherry season is a beautiful traffic jam. Trace the old Nakasendō through the Kiso Valley instead — the same temples, cedar forests and ryokan rituals, walked between post towns mostly alone.",
      signals: ["Overtourism: avoided", "Walkable route", "Heritage-rich"],
    },
  },
  {
    id: "lake-como",
    name: "Lake Como Shores",
    shortName: "Lake Como",
    region: "Lombardy, Italy",
    theme: "Classic elegance",
    pace: "6 serene days",
    tags: ["6 Days", "Luxury Lakeside", "Private Boat", "Curated Journey"],
    caption:
      "Lakeside villas, quiet shores, and passenger ferries set to the speed of the water.",
    image: "/images/journey-fife.jpg",
    alt: "Luxury lakeside villa on Lake Como at sunset",
    atmosphere: {
      primary: "rgba(116, 135, 107, 0.18)",
      secondary: "rgba(51, 51, 47, 0.12)",
      accent: "rgba(168, 166, 157, 0.08)",
    },
    insight: {
      query: "Lake Como off-season retreat",
      response:
        "Skip the summer tourist rush in Bellagio. Visit in late October when the lake mist rolls in, staying in Varenna to experience the authentic pace of local fishermen and quiet olive groves.",
      signals: ["Low footfall", "Local interaction", "Relaxed travel"],
    },
  },
  {
    id: "cappadocia",
    name: "Cappadocia Valleys",
    shortName: "Cappadocia",
    region: "Central Anatolia, Turkey",
    theme: "Ancient valleys",
    pace: "7 panoramic days",
    tags: ["7 Days", "Cinematic Skies", "Cave Suites", "Sunrise Trails"],
    caption:
      "Wind-sculpted stone canyons, cave dwellings, and quiet hot air balloon trails at dawn.",
    image: "/images/journey-crail.jpg",
    alt: "Close-up cinematic shot of hot air balloons at sunrise in Cappadocia",
    atmosphere: {
      primary: "rgba(116, 135, 107, 0.15)",
      secondary: "rgba(51, 51, 47, 0.10)",
      accent: "rgba(168, 166, 157, 0.08)",
    },
    insight: {
      query: "Cappadocia historical routes",
      response:
        "Avoid the main balloon launch pads. Wander through the quiet Rose and Red Valleys on foot, exploring rock-cut churches and cave systems that date back to the early Byzantine era.",
      signals: ["Hiking immersion", "Local heritage", "Sunrise trails"],
    },
  },
  {
    id: "tuscany",
    name: "Tuscan Vineyards",
    shortName: "Tuscany",
    region: "Tuscany, Italy",
    theme: "Culinary heritage",
    pace: "5 leisurely days",
    tags: ["5 Days", "Slow Food", "Vineyard Stay", "Private Chef"],
    caption:
      "Rolling hills, centuries-old olive groves, and long dinners set under the vineyard stars.",
    image: "/images/journey-scotland.jpg",
    alt: "Tuscany vineyard dinner scene at dusk",
    atmosphere: {
      primary: "rgba(116, 135, 107, 0.18)",
      secondary: "rgba(51, 51, 47, 0.10)",
      accent: "rgba(168, 166, 157, 0.12)",
    },
    insight: {
      query: "Authentic Tuscan dining",
      response:
        "Trade the crowded trattorias of Florence for an agriturismo deep in the Val d'Orcia. Join the harvest, learn to press olive oil, and dine with the family who grew your meal.",
      signals: ["Farm-to-table", "Agriturismo", "Family-run"],
    },
  },
  {
    id: "swiss-alps",
    name: "Alpine Railways",
    shortName: "Swiss Alps",
    region: "Bernese Oberland, Switzerland",
    theme: "Alpine immersion",
    pace: "8 glacial days",
    tags: ["8 Days", "Rail Journey", "Eco-Travel", "Mountain Chalets"],
    caption:
      "Deep valleys, seventy-two waterfalls, and the quiet creak of mountain railways.",
    image: "/images/swiss-alps.jpg",
    alt: "Swiss alpine rail journey through snow-capped mountains",
    atmosphere: {
      primary: "rgba(116, 135, 107, 0.22)",
      secondary: "rgba(51, 51, 47, 0.18)",
      accent: "rgba(168, 166, 157, 0.12)",
    },
    insight: {
      query: "Swiss Alps train tour",
      response:
        "Ditch the cable cars and tourist coaches. Travel on foot and by cogwheel train through Lauterbrunnen, letting Swiss timetables orchestrate your descent past high pasture chalets and glacial peaks.",
      signals: ["100% rail-reachable", "Low emission", "Unspoiled views"],
    },
  },
];


