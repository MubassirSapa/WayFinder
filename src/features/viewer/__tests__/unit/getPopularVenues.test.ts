import { describe, expect, it } from "vitest";

import { getPopularVenues } from "@/features/viewer/lib/getPopularVenues";
import type { LandingVenue } from "@/features/viewer/types";

function makeVenue(id: string, floorCount: number): LandingVenue {
  return {
    id,
    name: id,
    backgroundImageUrl: null,
    logoUrl: null,
    organizationId: "org-1",
    organizationName: "Org One",
    organizationLogoUrl: null,
    addedAt: "2026-07-28T12:00:00.000Z",
    href: `/map/${id}-0`,
    floors: Array.from({ length: floorCount }, (_, index) => ({
      id: `${id}-${index}`,
      name: `Floor ${index}`,
      level: index,
      href: `/map/${id}-${index}`,
    })),
  };
}

describe("getPopularVenues", () => {
  it("prioritizes venues with more published floor maps", () => {
    const venues = [makeVenue("one", 1), makeVenue("three", 3), makeVenue("two", 2)];

    expect(getPopularVenues(venues).map((venue) => venue.id)).toEqual(["three", "two", "one"]);
  });

  it("keeps one entry per grouped venue", () => {
    const venue = makeVenue("campus", 3);

    expect(getPopularVenues([venue])).toEqual([venue]);
  });
});
