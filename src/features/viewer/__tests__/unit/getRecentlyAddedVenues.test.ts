import { describe, expect, it } from "vitest";

import { getRecentlyAddedVenues } from "@/features/viewer/lib/getRecentlyAddedVenues";
import type { LandingVenue } from "@/features/viewer/types";

function makeVenue(id: string, addedAt: string): LandingVenue {
  return {
    id,
    name: `Venue ${id}`,
    backgroundImageUrl: null,
    logoUrl: null,
    organizationId: "org-1",
    organizationName: "Org One",
    organizationLogoUrl: null,
    addedAt,
    href: `/map/${id}`,
    floors: [{ id, name: `Floor ${id}`, level: 0, href: `/map/${id}` }],
  };
}

describe("getRecentlyAddedVenues", () => {
  it("returns the newest venues first", () => {
    const venues = [
      makeVenue("oldest", "2026-07-20T12:00:00.000Z"),
      makeVenue("newest", "2026-07-29T12:00:00.000Z"),
      makeVenue("middle", "2026-07-25T12:00:00.000Z"),
    ];

    expect(getRecentlyAddedVenues(venues).map((venue) => venue.id)).toEqual([
      "newest",
      "middle",
      "oldest",
    ]);
  });

  it("limits the result without changing the source array", () => {
    const venues = [
      makeVenue("one", "2026-07-29T12:00:00.000Z"),
      makeVenue("two", "2026-07-28T12:00:00.000Z"),
    ];

    expect(getRecentlyAddedVenues(venues, 1).map((venue) => venue.id)).toEqual(["one"]);
    expect(venues.map((venue) => venue.id)).toEqual(["one", "two"]);
  });
});
