export interface ContrastPoint {
  /** The broken-travel symptom */
  problem: string;
  /** Short elaboration of the problem */
  problemDetail: string;
  /** The Wayheld counter-principle */
  answer: string;
  /** Short elaboration of the Wayheld way */
  answerDetail: string;
}

export const WHY_KICKER = "Why travel feels broken";

export const WHY_HEADLINE = {
  lead: "We turned wonder into a",
  accent: "checklist",
  tail: ".",
};

export const WHY_INTRO =
  "Somewhere along the way, travel became a race — more places, more photos, more pressure. You come home exhausted, with a camera roll full of crowds and a faint sense you missed the actual place.";

/**
 * The central contrast: modern travel vs. the Wayheld way. Rendered as paired
 * rows so the "broken" side and the "held" side sit visibly side by side.
 */
export const CONTRASTS: ContrastPoint[] = [
  {
    problem: "Crowded",
    problemDetail:
      "The same twelve viewpoints, shoulder to shoulder, queuing for a photo of the queue.",
    answer: "Intentional",
    answerDetail:
      "We route you to places that can hold you — chosen for meaning, not for trending.",
  },
  {
    problem: "Rushed",
    problemDetail:
      "Five cities in seven days. A blur of stations, lobbies and half-seen wonders.",
    answer: "Slower",
    answerDetail:
      "Fewer stops, longer stays. Time enough for a place to stop performing and start being real.",
  },
  {
    problem: "Checklist-driven",
    problemDetail:
      "Ticking landmarks off a list someone else wrote, optimised for everyone but you.",
    answer: "Deeper",
    answerDetail:
      "Itineraries that follow your curiosity — heritage, craft, food, the quiet corners.",
  },
  {
    problem: "Extractive",
    problemDetail:
      "Money flows out, prices rise, locals get priced out of their own streets.",
    answer: "Community-focused",
    answerDetail:
      "Stays and guides that are locally owned, so your visit helps a place keep its soul.",
  },
];
