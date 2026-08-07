import { describe, expect, it } from "vitest";

import { filterVenues } from "@/features/viewer/lib/filterVenues";
import type { LandingVenue } from "@/features/viewer/types";

const venues: LandingVenue[] = [
  {
    id: "hospital",
    name: "Greenfield General Hospital",
    address: null,
    backgroundImageUrl: null,
    logoUrl: null,
    organizationId: "org-1",
    organizationName: "Org One",
    organizationLogoUrl: null,
    addedAt: "2026-07-28T12:00:00.000Z",
    href: "/map/1",
    floors: [{ id: "1", name: "Main Floor", level: 0, href: "/map/1" }],
  },
  {
    id: "campus",
    name: "Seneca Campus",
    address: null,
    backgroundImageUrl: null,
    logoUrl: null,
    organizationId: "org-1",
    organizationName: "Org One",
    organizationLogoUrl: null,
    addedAt: "2026-07-27T12:00:00.000Z",
    href: "/map/2",
    floors: [{ id: "2", name: "Main Floor", level: 0, href: "/map/2" }],
  },
  {
    id: "retail",
    name: "Central Market",
    address: null,
    backgroundImageUrl: null,
    logoUrl: null,
    organizationId: "org-2",
    organizationName: "Org Two",
    organizationLogoUrl: null,
    addedAt: "2026-07-26T12:00:00.000Z",
    href: "/map/3",
    floors: [{ id: "3", name: "Main Floor", level: 0, href: "/map/3" }],
  },
];

describe("filterVenues", () => {
  it("searches venue names without case sensitivity", () => {
    expect(filterVenues(venues, "greenFIELD")).toEqual([venues[0]]);
  });

  it("returns every venue for an empty query", () => {
    expect(filterVenues(venues, "")).toEqual(venues);
  });

  it("filters to only the given organization's venues", () => {
    expect(filterVenues(venues, "", "org-1")).toEqual([venues[0], venues[1]]);
    expect(filterVenues(venues, "", "org-2")).toEqual([venues[2]]);
  });

  it("combines the organization filter with the search query", () => {
    expect(filterVenues(venues, "campus", "org-1")).toEqual([venues[1]]);
    expect(filterVenues(venues, "campus", "org-2")).toEqual([]);
  });

  it("ignores the organization filter when not provided", () => {
    expect(filterVenues(venues, "")).toEqual(venues);
  });
});
