export interface Plan {
  id: string;
  /** Plan name */
  name: string;
  /** Price display, e.g. "$9.99" or "Free" */
  price: string;
  /** Cadence beneath the price, e.g. "/ month" — optional */
  cadence?: string;
  /** Short emotional positioning line */
  tagline: string;
  /** What's included */
  features: string[];
  /** CTA label */
  cta: string;
  /** Whether this is the highlighted membership */
  featured?: boolean;
  /** A small ribbon label for the featured plan */
  ribbon?: string;
}

export const MEMBERSHIP_KICKER = "Membership";

export const MEMBERSHIP_HEADLINE = {
  lead: "Belong to a",
  accent: "slower way",
  tail: " of moving through the world.",
};

export const MEMBERSHIP_INTRO =
  "No tiers of features dressed up as plans — just three honest ways to travel with Wayheld, however often the road calls.";

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Wanderer",
    price: "Free",
    tagline: "Start travelling with intention.",
    features: [
      "One guided journey draft",
      "Core slow-travel principles",
      "Overtourism-aware suggestions",
      "Save a single route",
    ],
    cta: "Begin for free",
  },
  {
    id: "journey",
    name: "Per Journey",
    price: "$29.99",
    cadence: "one journey",
    tagline: "For the trip you want to get right.",
    features: [
      "One fully crafted journey",
      "Deep local & cultural insight",
      "Regenerative stays & guides",
      "Day-by-day slow itinerary",
      "Offline-ready route",
    ],
    cta: "Plan a journey",
  },
  {
    id: "premium",
    name: "Wayheld Premium",
    price: "$9.99",
    cadence: "/ month",
    tagline: "For those who are always quietly planning the next one.",
    features: [
      "Unlimited journeys & routes",
      "Always-on AI travel companion",
      "Priority local knowledge",
      "Seasonal & footfall intelligence",
      "Early access to new regions",
      "Members-only slow stays",
    ],
    cta: "Become a member",
    featured: true,
    ribbon: "Most chosen",
  },
];
