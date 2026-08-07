import { describe, expect, it } from "vitest";

import { buildDashboardFloorOverview } from "../../../lib/dashboardOverview";

describe("buildDashboardFloorOverview", () => {
  it("sorts floors by activity and maps their real building and object counts", () => {
    const result = buildDashboardFloorOverview(
      [
        {
          id: 10,
          building: 1,
          name: "Ground floor",
          level: 0,
          backgroundImageUrl: "/media/ground-floor.png",
          status: "published",
          updatedAt: "2026-08-04T12:00:00.000Z",
        },
        {
          id: 11,
          building: 2,
          name: "Clinics",
          level: 2,
          backgroundImageUrl: null,
          status: "draft",
          updatedAt: "2026-08-05T12:00:00.000Z",
        },
      ],
      [
        { floor: 10, type: "room" },
        { floor: 10, type: "room" },
        { floor: 10, type: "poi" },
      ],
      [
        { id: "1", name: "Harbourfront Galleria", address: null, floorCount: 1, logoUrl: null },
        { id: "2", name: "Northstar Medical Centre", address: null, floorCount: 1, logoUrl: null },
      ],
      Date.parse("2026-08-06T12:00:00.000Z"),
    );

    expect(result.map((floor) => floor.id)).toEqual(["11", "10"]);
    expect(result[0]).toMatchObject({
      buildingName: "Northstar Medical Centre",
      level: 2,
      levelLabel: "Level 2",
      mapObjectCount: 0,
      status: "draft",
    });
    expect(result[1]).toMatchObject({
      buildingName: "Harbourfront Galleria",
      level: 0,
      levelLabel: "Ground",
      backgroundImageUrl: "/media/ground-floor.png",
      mapObjectCount: 3,
      roomCount: 2,
      poiCount: 1,
      status: "published",
    });
  });
});
