export interface Headline {
  /** Display lead — styled in serif */
  lead: string;
  /** Emphasised word/phrase rendered in the accent color */
  accent: string;
  /** Trailing remainder of the headline */
  tail: string;
}

export interface AiInsight {
  /** The traveller's short prompt, e.g. "East Coast Scotland" */
  query: string;
  /** Wayheld's editorial, intelligent reply (the emotional payload) */
  response: string;
  /** Small supporting signal chips that imply real analysis */
  signals: string[];
}

export interface Atmosphere {
  /** Primary ambient glow color */
  primary: string;
  /** Secondary ambient glow color */
  secondary: string;
  /** Warm accent glow color */
  accent: string;
}

/**
 * A single showcase destination. This is the unified model that drives the
 * featured stage, the thumbnail selector, the background atmosphere and the
 * AI recommendation simultaneously — so everything stays in sync as the hero
 * rotates.
 */
export interface ShowcaseDestination {
  /** Stable id used as React key and for analytics */
  id: string;
  /** Place name, e.g. "Kyoto Heritage Route" */
  name: string;
  /** Short destination name for selectors, e.g. "Kyoto" */
  shortName?: string;
  /** Country / region line */
  region: string;
  /** The cultural theme tag, e.g. "Heritage", "Ritual" */
  theme: string;
  /** Approximate days for an intentional visit */
  pace: string;
  /** Elegant metadata tags (e.g. "12 Days", "Slow Travel") */
  tags?: string[];
  /** Editorial one-liner describing the slow-travel experience */
  caption: string;
  /** Remote image URL (Unsplash) */
  image: string;
  /** Short alt text for accessibility */
  alt: string;
  /** Background atmosphere that blends in when this destination is active */
  atmosphere: Atmosphere;
  /** The AI recommendation tied to this destination */
  insight: AiInsight;
}
