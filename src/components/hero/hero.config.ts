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
  "We use local knowledge to route you away from heavy footfall and rigid schedules. Our itineraries are designed to give you the time to sit in quiet squares, share unhurried meals, until the place begins to feel less like somewhere you've visited and more like somewhere you've belonged.";

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
    name: "Market Morning",
    shortName: "Market",
    region: "Kyoto, Japan",
    theme: "Ritual & craft",
    pace: "9 unhurried days",
    tags: ["9 Days", "Slow Travel", "Local Hosts", "Heritage Route"],
    caption:
      "Spend quiet mornings wandering markets before the town fully wakes.",
    image: "/images/travel-assets/10_local_market.jpg",
    alt: "Local market morning",
    atmosphere: {
      primary: "rgba(116, 135, 107, 0.20)",
      secondary: "rgba(51, 51, 47, 0.15)",
      accent: "rgba(168, 166, 157, 0.10)",
    },
    insight: {
      query: "Kyoto without the spring crowds",
      response:
        "The spring season draws heavy footfall to the city centre. Consider the Kiso Valley instead—where the ancient cedar forests remain quiet, and evening rituals are shared with just a handful of other guests.",
      signals: ["Crowds avoided", "Walking pace", "Historical context"],
    },
  },
  {
    id: "lake-como",
    name: "Stories Between Streets",
    shortName: "Hidden Bookshop",
    region: "Lombardy, Italy",
    theme: "Classic elegance",
    pace: "6 serene days",
    tags: ["6 Days", "Luxury Lakeside", "Private Boat", "Curated Journey"],
    caption:
      "Stay long enough to discover cafés, conversations and everyday rituals.",
    image: "/images/travel-assets/08_bookstore.jpg",
    alt: "Quiet bookstore discovery",
    atmosphere: {
      primary: "rgba(116, 135, 107, 0.18)",
      secondary: "rgba(51, 51, 47, 0.12)",
      accent: "rgba(168, 166, 157, 0.08)",
    },
    insight: {
      query: "Lake Como off-season retreat",
      response:
        "The midsummer rush shifts the natural rhythm of the lake. Arrive in late October when the mist settles over the water, staying in Varenna to share morning espresso with the fishermen and walk through silent olive groves.",
      signals: ["Slower rhythm", "Community presence", "Seasonal quiet"],
    },
  },
  {
    id: "cappadocia",
    name: "Adventure Calling",
    shortName: "Adventure",
    region: "Central Anatolia, Turkey",
    theme: "Ancient valleys",
    pace: "7 panoramic days",
    tags: ["7 Days", "Cinematic Skies", "Cave Suites", "Sunrise Trails"],
    caption:
      "Step into the sky and experience valleys where the wind carries no schedule.",
    image: "/images/travel-assets/01_paragliding.jpg",
    alt: "Paragliding over valleys",
    atmosphere: {
      primary: "rgba(116, 135, 107, 0.15)",
      secondary: "rgba(51, 51, 47, 0.10)",
      accent: "rgba(168, 166, 157, 0.08)",
    },
    insight: {
      query: "Cappadocia historical routes",
      response:
        "The main launch sites draw thousands each morning. Walk the lower paths of the Rose Valley on foot, finding ancient rock-cut architecture without the pressure to keep moving.",
      signals: ["Independent pacing", "Local trails", "Morning stillness"],
    },
  },
  {
    id: "tuscany",
    name: "Old Stone Streets",
    shortName: "Tuscany",
    region: "Tuscany, Italy",
    theme: "Culinary heritage",
    pace: "5 leisurely days",
    tags: ["5 Days", "Slow Food", "Vineyard Stay", "Private Chef"],
    caption:
      "Take the slower route through villages where locals still know every neighbour.",
    image: "/images/travel-assets/12_tuscan_alley.jpg",
    alt: "Old stone streets in Tuscany",
    atmosphere: {
      primary: "rgba(116, 135, 107, 0.18)",
      secondary: "rgba(51, 51, 47, 0.10)",
      accent: "rgba(168, 166, 157, 0.12)",
    },
    insight: {
      query: "Authentic Tuscan dining",
      response:
        "The city trattorias turn tables quickly. Travel south to an independent farm in the Val d'Orcia, where you can help with the olive harvest and sit down to a meal that took hours to prepare.",
      signals: ["Slow food", "Family-run farms", "Shared tables"],
    },
  },
  {
    id: "swiss-alps",
    name: "The Empty Trail",
    shortName: "Swiss Alps",
    region: "Bernese Oberland, Switzerland",
    theme: "Alpine immersion",
    pace: "8 glacial days",
    tags: ["8 Days", "Rail Journey", "Eco-Travel", "Mountain Chalets"],
    caption:
      "Walk desert paths that demand your full attention and reward you with absolute stillness.",
    image: "/images/travel-assets/07_desert_hiker.jpg",
    alt: "Desert hiking on the empty trail",
    atmosphere: {
      primary: "rgba(116, 135, 107, 0.22)",
      secondary: "rgba(51, 51, 47, 0.18)",
      accent: "rgba(168, 166, 157, 0.12)",
    },
    insight: {
      query: "Swiss Alps train tour",
      response:
        "The large cable cars move at an industrial pace. Take the local cogwheel trains up through the Lauterbrunnen valley, stopping at high-altitude farming chalets where the only sound is the wind.",
      signals: ["Local rail", "Isolated cabins", "Mountain quiet"],
    },
  },
];
