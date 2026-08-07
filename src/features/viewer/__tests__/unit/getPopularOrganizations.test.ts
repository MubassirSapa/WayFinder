import { describe, expect, it } from "vitest";

import { getPopularOrganizations } from "@/features/viewer/lib/getPopularOrganizations";
import type { LandingVenue } from "@/features/viewer/types";

function makeVenue(id: string, organizationId: string, organizationName: string): LandingVenue {
  return {
    id,
    name: id,
    address: null,
    backgroundImageUrl: null,
    logoUrl: null,
    organizationId,
    organizationName,
    organizationLogoUrl: null,
    addedAt: "2026-07-28T12:00:00.000Z",
    href: `/map/${id}-0`,
    floors: [{ id: `${id}-0`, name: "Floor 0", level: 0, href: `/map/${id}-0` }],
  };
}

describe("getPopularOrganizations", () => {
  it("groups venues by organization and counts buildings per org", () => {
    const venues = [
      makeVenue("a", "org-1", "Org One"),
      makeVenue("b", "org-1", "Org One"),
      makeVenue("c", "org-2", "Org Two"),
    ];

    const organizations = getPopularOrganizations(venues);

    expect(organizations).toEqual([
      { id: "org-1", name: "Org One", logoUrl: null, venueCount: 2 },
      { id: "org-2", name: "Org Two", logoUrl: null, venueCount: 1 },
    ]);
  });

  it("prioritizes organizations with more buildings", () => {
    const venues = [
      makeVenue("a", "org-1", "Org One"),
      makeVenue("b", "org-2", "Org Two"),
      makeVenue("c", "org-2", "Org Two"),
      makeVenue("d", "org-2", "Org Two"),
    ];

    expect(getPopularOrganizations(venues).map((org) => org.id)).toEqual(["org-2", "org-1"]);
  });

  it("skips venues with no organization", () => {
    const venue = makeVenue("a", "", "");

    expect(getPopularOrganizations([venue])).toEqual([]);
  });
});
