/**
 * Journey feeling options — client App Overview list only.
 * Stored on Journey.metadata.feelings as string ids.
 */

import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BookOpen,
  Building2,
  Camera,
  Landmark,
  Leaf,
  Scale,
  Trees,
  Turtle,
  University,
  Wheat,
} from "lucide-react";

export type JourneyFeeling = {
  id: string;
  label: string;
  description: string;
  Icon: LucideIcon;
};

export const JOURNEY_FEELINGS: JourneyFeeling[] = [
  {
    id: "unhurried",
    label: "Unhurried",
    description: "Slow days, soft edges, and time left unfilled.",
    Icon: Turtle,
  },
  {
    id: "balanced",
    label: "Balanced",
    description: "A considered mix of movement and stillness.",
    Icon: Scale,
  },
  {
    id: "active",
    label: "Active",
    description: "Walks, trails, and days that keep you lightly in motion.",
    Icon: Activity,
  },
  {
    id: "nature-focused",
    label: "Nature-focused",
    description: "Landscapes, quiet wilds, and outdoor breathing room.",
    Icon: Trees,
  },
  {
    id: "history-forward",
    label: "History-forward",
    description: "Layers of the past, told through place and craft.",
    Icon: University,
  },
  {
    id: "cultural",
    label: "Cultural",
    description: "Living traditions, ritual, food, and local rhythm.",
    Icon: Leaf,
  },
  {
    id: "urban",
    label: "Urban",
    description: "City texture — neighbourhoods, markets, and street life.",
    Icon: Building2,
  },
  {
    id: "rural",
    label: "Rural",
    description: "Countryside pace, open space, and quieter roads.",
    Icon: Wheat,
  },
  {
    id: "photography-focused",
    label: "Photography-focused",
    description: "Light, composition, and places that reward a slower look.",
    Icon: Camera,
  },
  {
    id: "famous-landmarks",
    label: "Famous Landmarks",
    description: "Iconic sights approached with care, not a checklist.",
    Icon: Landmark,
  },
  {
    id: "literary-rich",
    label: "Literary-rich",
    description: "Stories, writers, and places that live on the page.",
    Icon: BookOpen,
  },
];

export const MAX_JOURNEY_FEELINGS = 5;

/** How each chip should steer Discovery place selection. */
const FEELING_CURATION: Record<string, string> = {
  unhurried:
    "Fewer, quieter places with room to linger — soft walks, courtyards, unhurried cafés.",
  balanced:
    "A considered mix of stillness and light movement across neighbourhoods, food, culture, and nature.",
  active:
    "Walks, trails, outdoor routes, and places that invite light physical exploration.",
  "nature-focused":
    "Landscapes, parks, gardens, coastal paths, quiet wilds, and outdoor breathing room.",
  "history-forward":
    "Historic layers told through place and craft — museums, heritage streets, workshops, ruins approached slowly.",
  cultural:
    "Living traditions, ritual, local food, markets, and neighbourhood rhythm — not tourist spectacle.",
  urban:
    "City texture — neighbourhoods, markets, street life, plazas, and everyday urban corners.",
  rural:
    "Countryside pace, villages, open space, quieter roads, and agrarian landscapes.",
  "photography-focused":
    "Places that reward a slower look — light, composition, viewpoints, textured streets, and scenic stillness.",
  "famous-landmarks":
    "Iconic sights approached with care and context — not a checklist rush; pair with quieter nearby corners.",
  "literary-rich":
    "Stories, writers, bookish corners, literary neighbourhoods, and places that live on the page.",
};

export type JourneyPace =
  | "ONE_PLACE_DEEPLY"
  | "SLOW_UNHURRIED"
  | "GENTLY_BALANCED";

export function feelingLabels(ids: string[] | undefined | null): string[] {
  if (!ids?.length) return [];
  const map = new Map(JOURNEY_FEELINGS.map((f) => [f.id, f.label]));
  return ids.map((id) => map.get(id) || id);
}

/** Rich prompt text so the model can match places to selected chips. */
export function feelingPromptText(
  ids: string[] | undefined | null,
): string {
  if (!ids?.length) return "";
  const byId = new Map(JOURNEY_FEELINGS.map((f) => [f.id, f]));
  return ids
    .map((id) => {
      const feeling = byId.get(id);
      const label = feeling?.label ?? id;
      const description = feeling?.description ?? "";
      const curation = FEELING_CURATION[id] ?? description;
      return `${label}: ${curation}`;
    })
    .join(" | ");
}

/**
 * Derive legacy pace from rhythm chips so pace guidance stays aligned
 * with Journey Feel selections.
 */
export function paceFromFeelings(
  ids: string[] | undefined | null,
): JourneyPace {
  let pace: JourneyPace = "GENTLY_BALANCED";
  for (const id of ids ?? []) {
    if (id === "unhurried") pace = "SLOW_UNHURRIED";
    else if (id === "balanced" || id === "active") pace = "GENTLY_BALANCED";
  }
  return pace;
}
