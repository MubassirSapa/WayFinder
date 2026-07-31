import type { LandingVenue } from "@/features/viewer/types";

const RECENT_VENUE_LIMIT = 4;

export function getRecentlyAddedVenues(
  venues: LandingVenue[],
  limit = RECENT_VENUE_LIMIT,
): LandingVenue[] {
  return sortVenuesByNewest(venues).slice(0, limit);
}

export function sortVenuesByNewest(venues: LandingVenue[]): LandingVenue[] {
  return [...venues].sort(
    (first, second) =>
      Date.parse(second.addedAt) - Date.parse(first.addedAt) ||
      first.name.localeCompare(second.name),
  );
}
