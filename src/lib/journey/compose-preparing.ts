/**
 * Copy helpers for the "Preparing your journey" compose screen.
 * Affirmations reference destination, feeling chips, and selected places.
 */

import { JOURNEY_FEELINGS, feelingLabels } from "@/lib/journey/feelings";

const FEELING_PHRASE: Record<string, string> = {
  unhurried: "unhurried days",
  balanced: "a gentle balance of movement and stillness",
  active: "light movement through the day",
  "nature-focused": "nature and open air",
  "history-forward": "layers of history",
  cultural: "living culture and local rhythm",
  urban: "city texture and neighbourhood life",
  rural: "quieter countryside pace",
  "photography-focused": "light and places worth lingering over",
  "famous-landmarks": "iconic landmarks approached with care",
  "literary-rich": "stories woven into place",
};

function joinHuman(parts: string[]): string {
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}

/** Supporting line under the headline — derived from selected feelings. */
export function buildPreparingSubtitle(feelingIds: string[]): string {
  const phrases = feelingIds
    .map((id) => FEELING_PHRASE[id])
    .filter((p): p is string => !!p)
    .slice(0, 3);

  if (phrases.length === 0) {
    return "We're shaping a journey with space to linger — and room to soak it all in.";
  }

  return `We're shaping a journey that balances ${joinHuman(phrases)} — with room to slow down and soak it all in.`;
}

type AffirmationInput = {
  firstName: string | null;
  destination: string;
  feelingIds: string[];
  placeTitles: string[];
  placeCategories: string[];
};

/**
 * Personalized card copy: affirms the traveler's choices using destination,
 * feeling chips, and the places they added from Discovery.
 */
export function buildPreparingAffirmation(input: AffirmationInput): {
  greeting: string;
  body: string;
} {
  const name = input.firstName?.trim();
  const greeting = name ? `Great choices, ${name}.` : "Great choices.";

  const destination = input.destination.trim() || "this destination";
  const labels = feelingLabels(input.feelingIds).slice(0, 3);
  const placeHints = input.placeTitles
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 2);
  const categories = [
    ...new Set(
      input.placeCategories
        .map((c) => c.trim().toLowerCase())
        .filter(Boolean),
    ),
  ].slice(0, 3);

  let body: string;

  if (labels.length > 0 && placeHints.length > 0) {
    const placeBit =
      placeHints.length === 1
        ? `“${placeHints[0]}”`
        : `“${placeHints[0]}” and “${placeHints[1]}”`;
    body = `${destination} rewards exactly what you chose — ${joinHuman(
      labels.map((l) => l.toLowerCase()),
    )} — and places like ${placeBit} already set the tone. You’re building something beautiful and meaningful.`;
  } else if (labels.length > 0) {
    body = `${destination} is a natural match for ${joinHuman(
      labels.map((l) => l.toLowerCase()),
    )} — a place where those instincts turn into days that feel right.`;
  } else if (placeHints.length > 0) {
    const placeBit =
      placeHints.length === 1
        ? `“${placeHints[0]}”`
        : `“${placeHints[0]}” and “${placeHints[1]}”`;
    body = `${destination} comes alive through the places you picked — ${placeBit} already hint at a journey with beauty and meaning.`;
  } else if (categories.length > 0) {
    body = `${destination}’s ${joinHuman(
      categories,
    )} side is exactly where your instincts point — a blend of beauty and meaning waiting to be arranged into days.`;
  } else {
    body = `${destination} carries the quiet confidence to match the journey you’re shaping — beauty with meaning, and room to feel it.`;
  }

  return { greeting, body };
}

export function resolveFeelingChips(feelingIds: string[]) {
  const byId = new Map(JOURNEY_FEELINGS.map((f) => [f.id, f]));
  return feelingIds
    .map((id) => byId.get(id))
    .filter((f): f is (typeof JOURNEY_FEELINGS)[number] => !!f);
}
