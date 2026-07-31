import type { LandingVenue } from "@/features/viewer/types";

const POPULAR_MAP_LIMIT = 8;

export function getPopularVenues(venues: LandingVenue[]): LandingVenue[] {
  return [...venues]
    .sort((a, b) => b.floors.length - a.floors.length || a.name.localeCompare(b.name))
    .slice(0, POPULAR_MAP_LIMIT);
}
