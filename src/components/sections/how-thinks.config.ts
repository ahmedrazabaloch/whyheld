export interface ThinkingStage {
  /** Short stage label, e.g. "Traveller intent" */
  label: string;
  /** The voice/source of this stage */
  voice: "you" | "wayheld" | "local" | "route";
  /** The headline line for this stage (editorial) */
  line: string;
  /** Supporting detail beneath the line */
  detail: string;
  /** Small signal chips that imply real reasoning (optional) */
  signals?: string[];
}

export const HOW_KICKER = "How Wayheld thinks";

export const HOW_HEADLINE = {
  lead: "Not a chatbot.",
  accent: "A travelled mind",
  tail: ".",
};

export const HOW_INTRO =
  "Ask Wayheld a question and it doesn't search — it considers. Your intent meets local knowledge, cultural context and a quiet refusal to send you where everyone else is going.";

/**
 * The four-beat reasoning flow rendered as a vertical, scroll-revealed
 * narrative: Traveller Intent → Wayheld Intelligence → Local Insight →
 * Meaningful Route. Deliberately editorial — no diagrams, no chat bubbles.
 */
export const THINKING_STAGES: ThinkingStage[] = [
  {
    label: "Traveller intent",
    voice: "you",
    line: "“I want a quiet week in Scotland.”",
    detail:
      "You arrive with a feeling, not a spreadsheet. Wayheld starts there — with what you actually want from the time.",
  },
  {
    label: "Wayheld intelligence",
    voice: "wayheld",
    line: "“While crowds queue for Glencoe and compete for parking on Skye, the east coast quietly gets on with being extraordinary.”",
    detail:
      "It weighs the season, the footfall, the pace you asked for — and steers you away from the places already buckling under attention.",
    signals: ["Reads intent", "Avoids overtourism", "Respects pace"],
  },
  {
    label: "Local insight",
    voice: "local",
    line: "“Go in September. The fishing villages of Fife are quiet, and the harbour cafés keep their own hours.”",
    detail:
      "Grounded in knowledge from people who live there — not a scraped listing, but the texture only locals carry.",
    signals: ["Local sources", "Cultural context", "Seasonal nuance"],
  },
  {
    label: "Meaningful route",
    voice: "route",
    line: "Seven unhurried days along the East Neuk, ending on the Aberdeenshire cliffs.",
    detail:
      "The output isn't a checklist — it's a route with room to breathe, built to leave the place better than it found it.",
    signals: ["Slow by design", "Regenerative stays", "Yours alone"],
  },
];
