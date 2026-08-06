/**
 * Explore filter chips — client App Overview list only.
 */

export type ExploreFilter = {
  id: string;
  label: string;
};

export const EXPLORE_FILTERS: ExploreFilter[] = [
  { id: "cafes", label: "Cafes" },
  { id: "coffee-shops", label: "Coffee shops" },
  { id: "restaurants", label: "Restaurants" },
  { id: "vegan-friendly", label: "Vegan-friendly" },
  { id: "local-feel", label: "Local-feel" },
  { id: "pilgrimage-routes", label: "Pilgrimage routes" },
  { id: "hiking", label: "Hiking" },
  { id: "museums", label: "Museums" },
  { id: "galleries", label: "Galleries" },
  { id: "quiet-corners", label: "Quiet corners" },
];

export function exploreFilterLabels(ids: string[] | undefined | null): string[] {
  if (!ids?.length) return [];
  const map = new Map(EXPLORE_FILTERS.map((f) => [f.id, f.label]));
  return ids.map((id) => map.get(id) || id);
}

/** How each chip should steer Explore place selection. */
const FILTER_CURATION: Record<string, string> = {
  cafes: "Neighbourhood cafés with a lived-in rhythm — places locals sit with.",
  "coffee-shops":
    "Roasters and small coffee rooms where the craft matters more than the setting.",
  restaurants:
    "Places to eat that belong to the destination — family tables, regional cooking, everyday dining rooms.",
  "vegan-friendly":
    "Kitchens with genuine plant-based cooking, not token menu additions.",
  "local-feel":
    "Everyday corners away from tourist flow — markets, side streets, community spaces.",
  "pilgrimage-routes":
    "Walking routes with devotional or historic weight — stages, waymarks, resting points.",
  hiking: "Trails, ridges, coastal paths, and walks with a clear route to follow.",
  museums:
    "Collections worth slow time — regional, specialised, or single-subject over blockbuster halls.",
  galleries:
    "Art spaces with a point of view — small galleries, artist studios, exhibition rooms.",
  "quiet-corners":
    "Places to sit and do nothing — courtyards, reading rooms, gardens, empty churches.",
};

/** Rich prompt text so the model can match places to selected chips. */
export function exploreFilterPromptText(
  ids: string[] | undefined | null,
): string {
  if (!ids?.length) return "";
  const byId = new Map(EXPLORE_FILTERS.map((f) => [f.id, f]));
  return ids
    .map((id) => {
      const label = byId.get(id)?.label ?? id;
      const curation = FILTER_CURATION[id];
      return curation ? `${label}: ${curation}` : label;
    })
    .join(" | ");
}
