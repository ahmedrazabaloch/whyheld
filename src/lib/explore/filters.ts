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
