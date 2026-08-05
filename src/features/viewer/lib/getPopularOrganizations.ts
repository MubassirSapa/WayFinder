import type { LandingOrganization, LandingVenue } from "@/features/viewer/types";

const POPULAR_ORGANIZATION_LIMIT = 8;

export function getPopularOrganizations(venues: LandingVenue[]): LandingOrganization[] {
  const groups = new Map<string, LandingOrganization>();

  for (const venue of venues) {
    if (!venue.organizationId) continue;

    const existing = groups.get(venue.organizationId);
    if (existing) {
      existing.venueCount += 1;
      continue;
    }

    groups.set(venue.organizationId, {
      id: venue.organizationId,
      name: venue.organizationName,
      logoUrl: venue.organizationLogoUrl,
      venueCount: 1,
    });
  }

  return Array.from(groups.values())
    .sort((a, b) => b.venueCount - a.venueCount || a.name.localeCompare(b.name))
    .slice(0, POPULAR_ORGANIZATION_LIMIT);
}
