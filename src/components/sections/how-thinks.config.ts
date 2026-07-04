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

export const HOW_KICKER = "A quieter approach";

export const HOW_HEADLINE = {
  lead: "Not a chatbot.",
  accent: "A travelled mind",
  tail: ".",
};

export const HOW_INTRO =
  "A true journey is shaped by the quiet routines you fall into. Rather than pointing you toward familiar crowds, we draw on local relationships to guide you toward neighbourhoods that invite you to stay a little longer.";

/**
 * The four-beat reasoning flow rendered as a vertical, scroll-revealed
 * narrative: Traveller Intent → Wayheld Intelligence → Local Insight →
 * Meaningful Route. Deliberately editorial — no diagrams, no chat bubbles.
 */
export const THINKING_STAGES: ThinkingStage[] = [
  {
    label: "The intention",
    voice: "you",
    line: "“I am looking for a quiet week along the coast.”",
    detail:
      "A journey rarely begins with a rigid plan. It starts with a simple feeling—a need for slower days, familiar streets, and the time to sit still.",
  },
  {
    label: "Lived experience",
    voice: "wayheld",
    line: "“While the western highlands draw the summer crowds, the eastern fishing villages quietly go about their daily routines.”",
    detail:
      "Understanding a region means knowing how it breathes. We look beyond the obvious, guiding you away from the footfall and toward communities where life moves at its own pace.",
    signals: ["Local understanding", "Quiet spaces", "Natural rhythm"],
  },
  {
    label: "Local voices",
    voice: "local",
    line: "“Arrive in late September. The morning mist stays a little longer, and the harbour cafés are filled only with fishermen.”",
    detail:
      "True insight always comes from those who call a place home. It is found in shared meals, morning conversations, and the quiet knowledge that only years of belonging can provide.",
    signals: ["Shared stories", "Community presence", "Seasonal quiet"],
  },
  {
    label: "Shared presence",
    voice: "route",
    line: "Seven unhurried days along the eastern coast, leaving enough room for a place to change you.",
    detail:
      "This isn't an itinerary to complete. It's enough time for a place to stop feeling unfamiliar. It is an invitation to unpack your bags, learn the neighbourhood, and return home carrying a little of that place with you.",
    signals: ["Unhurried pacing", "Independent spaces", "True connection"],
  },
];
