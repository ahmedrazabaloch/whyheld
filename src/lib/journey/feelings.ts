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

export function feelingLabels(ids: string[] | undefined | null): string[] {
  if (!ids?.length) return [];
  const map = new Map(JOURNEY_FEELINGS.map((f) => [f.id, f.label]));
  return ids.map((id) => map.get(id) || id);
}
