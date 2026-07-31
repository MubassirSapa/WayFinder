import { describe, expect, it } from "vitest";

import { filterVenues } from "@/features/viewer/lib/filterVenues";
import type { LandingVenue } from "@/features/viewer/types";

const venues: LandingVenue[] = [
  {
    id: "hospital",
    name: "Greenfield General Hospital",
    backgroundImageUrl: null,
    addedAt: "2026-07-28T12:00:00.000Z",
    href: "/map/1",
    floors: [{ id: "1", name: "Main Floor", level: 0, href: "/map/1" }],
  },
  {
    id: "campus",
    name: "Seneca Campus",
    backgroundImageUrl: null,
    addedAt: "2026-07-27T12:00:00.000Z",
    href: "/map/2",
    floors: [{ id: "2", name: "Main Floor", level: 0, href: "/map/2" }],
  },
  {
    id: "retail",
    name: "Central Market",
    backgroundImageUrl: null,
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
});
