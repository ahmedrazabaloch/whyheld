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
  "Most journeys are measured by how many places they include. We believe they're remembered for the conversations, routines, and relationships that quietly stay with you long after you've returned home. The moments people remember years later are rarely the famous ones. They're the conversations that weren't planned, the meals that lasted too long, and the streets that slowly began to feel familiar.";

/**
 * The central contrast: modern travel vs. the Wayheld way. Rendered as paired
 * rows so the "broken" side and the "held" side sit visibly side by side.
 */
export const CONTRASTS: ContrastPoint[] = [
  {
    problem: "Collecting places",
    problemDetail:
      "Treating geography as a list of boxes to check, leaving no margin for the unplanned.",
    answer: "Following curiosity",
    answerDetail:
      "The most rewarding routes reveal themselves when you leave the itinerary behind and let the day unfold naturally.",
  },
  {
    problem: "Relentless pace",
    problemDetail:
      "Moving constantly across multiple cities, reducing complex cultures to a blur of transit hubs.",
    answer: "Deep presence",
    answerDetail:
      "Remaining in one place until familiar faces become part of your day and the destination begins to feel less like somewhere you're visiting.",
  },
  {
    problem: "Chasing monuments",
    problemDetail:
      "Standing shoulder to shoulder with thousands to capture the identical photograph of a famous façade.",
    answer: "Human connection",
    answerDetail:
      "Sitting down to share a meal with the people who live there, sharing a table long enough that strangers stop feeling like strangers.",
  },
  {
    problem: "Passive observation",
    problemDetail:
      "Walking through a neighbourhood as an outsider, inadvertently straining the local resources and housing.",
    answer: "Rooted community",
    answerDetail:
      "Choosing independent lodgings and local voices, leaving behind friendships instead of footprints.",
  },
];
