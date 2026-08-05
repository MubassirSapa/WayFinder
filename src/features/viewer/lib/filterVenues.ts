import type { LandingVenue } from "@/features/viewer/types";

export function filterVenues(venues: LandingVenue[], query: string, organizationId?: string | null) {
  const normalizedQuery = query.trim().toLowerCase();

  return venues.filter((venue) => {
    if (organizationId && venue.organizationId !== organizationId) return false;
    return !normalizedQuery || venue.name.toLowerCase().includes(normalizedQuery);
  });
}
