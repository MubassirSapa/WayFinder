import type { LandingVenue } from "@/features/viewer/types";

export function filterVenues(venues: LandingVenue[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  return venues.filter(
    (venue) => !normalizedQuery || venue.name.toLowerCase().includes(normalizedQuery),
  );
}
