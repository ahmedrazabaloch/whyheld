import type {
  ComposedDay,
  ComposedJourney,
  ComposedPlaceSlot,
} from "@/lib/ai/schemas/composed-journey";
import { syncPlaceTitles } from "@/lib/utils/composed-journey";
import type { DiscoveryPlace } from "@/components/discovery/discovery-data";

export function updateDayPlaces(
  journey: ComposedJourney,
  dayNumber: number,
  updater: (places: ComposedPlaceSlot[]) => ComposedPlaceSlot[],
): ComposedJourney {
  return {
    ...journey,
    days: journey.days.map((day) => {
      if (day.dayNumber !== dayNumber) return day;
      return syncPlaceTitles({
        ...day,
        places: updater([...(day.places ?? [])]),
      });
    }),
  };
}

export function removePlaceFromDay(
  journey: ComposedJourney,
  dayNumber: number,
  placeId: string,
): ComposedJourney {
  return updateDayPlaces(journey, dayNumber, (places) =>
    places.filter((p) => p.id !== placeId),
  );
}

export function togglePlaceLock(
  journey: ComposedJourney,
  dayNumber: number,
  placeId: string,
): ComposedJourney {
  return updateDayPlaces(journey, dayNumber, (places) =>
    places.map((p) => (p.id === placeId ? { ...p, locked: !p.locked } : p)),
  );
}

export function reorderPlaceInDay(
  journey: ComposedJourney,
  dayNumber: number,
  placeId: string,
  direction: "up" | "down",
): ComposedJourney {
  return updateDayPlaces(journey, dayNumber, (places) => {
    const index = places.findIndex((p) => p.id === placeId);
    if (index < 0) return places;
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= places.length) return places;
    const next = [...places];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item!);
    return next;
  });
}

export function movePlaceToDay(
  journey: ComposedJourney,
  fromDay: number,
  placeId: string,
  toDay: number,
): ComposedJourney {
  if (fromDay === toDay) return journey;

  let moving: ComposedPlaceSlot | null = null;

  const without = journey.days.map((day) => {
    if (day.dayNumber !== fromDay) return day;
    const places = [...(day.places ?? [])];
    const index = places.findIndex((p) => p.id === placeId);
    if (index < 0) return day;
    moving = places[index]!;
    places.splice(index, 1);
    return syncPlaceTitles({ ...day, places });
  });

  if (!moving) return journey;

  return {
    ...journey,
    days: without.map((day) => {
      if (day.dayNumber !== toDay) return day;
      const places = [...(day.places ?? [])];
      if (places.some((p) => p.id === moving!.id || p.title === moving!.title)) {
        return day;
      }
      places.push(moving!);
      return syncPlaceTitles({ ...day, places });
    }),
  };
}

export function addPlaceToDay(
  journey: ComposedJourney,
  dayNumber: number,
  place: DiscoveryPlace,
): ComposedJourney {
  return updateDayPlaces(journey, dayNumber, (places) => {
    if (
      places.some(
        (p) =>
          p.id === place.id ||
          p.title.trim().toLowerCase() === place.title.trim().toLowerCase(),
      )
    ) {
      return places;
    }
    return [
      ...places,
      { id: place.id, title: place.title, locked: false },
    ];
  });
}

export function placesAlreadyInItinerary(journey: ComposedJourney): Set<string> {
  const ids = new Set<string>();
  for (const day of journey.days) {
    for (const place of day.places ?? []) {
      ids.add(place.id);
      ids.add(place.title.trim().toLowerCase());
    }
  }
  return ids;
}

export function availableDiscoveryPlaces(
  journey: ComposedJourney,
  discoveryPlaces: DiscoveryPlace[],
): DiscoveryPlace[] {
  const used = placesAlreadyInItinerary(journey);
  return discoveryPlaces.filter(
    (p) => !used.has(p.id) && !used.has(p.title.trim().toLowerCase()),
  );
}

export function findDay(journey: ComposedJourney, dayNumber: number): ComposedDay | undefined {
  return journey.days.find((d) => d.dayNumber === dayNumber);
}

/** Remove a full day and renumber remaining days 1…n. Keeps at least one day. */
/**
 * Swap a day with its neighbour, then renumber so days stay 1..N in order.
 * Moving Day 3 down makes it Day 4 and the old Day 4 becomes Day 3.
 */
export function moveDayInJourney(
  journey: ComposedJourney,
  dayNumber: number,
  direction: "up" | "down",
): ComposedJourney {
  const index = journey.days.findIndex((d) => d.dayNumber === dayNumber);
  if (index < 0) return journey;

  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= journey.days.length) return journey;

  const days = [...journey.days];
  const moving = days[index]!;
  days[index] = days[target]!;
  days[target] = moving;

  return {
    ...journey,
    days: days.map((day, i) => ({ ...day, dayNumber: i + 1 })),
  };
}

export function removeDayFromJourney(
  journey: ComposedJourney,
  dayNumber: number,
): ComposedJourney {
  if (journey.days.length <= 1) return journey;

  const remaining = journey.days.filter((d) => d.dayNumber !== dayNumber);
  return {
    ...journey,
    days: remaining.map((day, index) => ({
      ...day,
      dayNumber: index + 1,
    })),
  };
}
