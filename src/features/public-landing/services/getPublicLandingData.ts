import "server-only";

import config from "@payload-config";
import type { Floor, MapObject } from "@/payload-types";
import { getPayload } from "payload";

import { formatBuildingName } from "@/features/public-landing/lib/format";
import type {
  LandingDestination,
  LandingVenue,
  PublicLandingData,
} from "@/features/public-landing/types";

type VenueGroup = {
  buildingId: string;
  floors: Floor[];
  searchableCount: number;
  accessibleCount: number;
};

async function getPayloadClient() {
  return getPayload({ config });
}

export async function getPublicLandingData(): Promise<PublicLandingData> {
  try {
    const payload = await getPayloadClient();

    const [floorsResult, objectsResult] = await Promise.all([
      payload.find({
        collection: "floors",
        depth: 0,
        limit: 100,
        overrideAccess: true,
        sort: "-updatedAt",
        where: {
          status: {
            equals: "published",
          },
        },
      }),
      payload.find({
        collection: "map-objects",
        depth: 1,
        limit: 100,
        overrideAccess: true,
        sort: "-updatedAt",
        where: {
          isSearchable: {
            equals: true,
          },
        },
      }),
    ]);

    const floors = floorsResult.docs as Floor[];
    const searchableObjects = objectsResult.docs as MapObject[];
    const groups = new Map<string, VenueGroup>();

    for (const floor of floors) {
      const existing = groups.get(floor.buildingId);

      if (existing) {
        existing.floors.push(floor);
        continue;
      }

      groups.set(floor.buildingId, {
        buildingId: floor.buildingId,
        floors: [floor],
        searchableCount: 0,
        accessibleCount: 0,
      });
    }

    for (const item of searchableObjects) {
      const group = groups.get(item.buildingId);

      if (!group) continue;

      group.searchableCount += 1;
      if (item.isAccessible) group.accessibleCount += 1;
    }

    const venues = Array.from(groups.values())
      .map(toLandingVenue)
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));

    const recentDestinations = searchableObjects
      .filter((item) => groups.has(item.buildingId))
      .slice(0, 5)
      .map(toLandingDestination);

    return {
      venues,
      recentDestinations,
      stats: {
        venueCount: venues.length,
        floorCount: floors.length,
        destinationCount: searchableObjects.length,
      },
      isAvailable: true,
    };
  } catch (error) {
    console.error("Failed to load public landing data:", error);

    return {
      venues: [],
      recentDestinations: [],
      stats: {
        venueCount: 0,
        floorCount: 0,
        destinationCount: 0,
      },
      isAvailable: false,
    };
  }
}

function toLandingVenue(group: VenueGroup): LandingVenue {
  const sortedFloors = [...group.floors].sort((a, b) => a.level - b.level);
  const primaryFloor = [...group.floors].sort(
    (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
  )[0];

  return {
    id: group.buildingId,
    name: formatBuildingName(group.buildingId),
    floorCount: sortedFloors.length,
    searchableCount: group.searchableCount,
    accessibleCount: group.accessibleCount,
    primaryFloorName: primaryFloor.name,
    backgroundImageUrl: primaryFloor.backgroundImageUrl ?? null,
    updatedAt: primaryFloor.updatedAt,
    floors: sortedFloors.map((floor) => ({
      id: String(floor.id),
      name: floor.name,
      level: floor.level,
      backgroundImageUrl: floor.backgroundImageUrl ?? null,
      updatedAt: floor.updatedAt,
      href: `/editor/${floor.id}`,
    })),
  };
}

function toLandingDestination(item: MapObject): LandingDestination {
  const floor = typeof item.floor === "object" ? item.floor : null;

  return {
    id: String(item.id),
    name: item.label || item.name,
    type: item.type,
    venueName: formatBuildingName(item.buildingId),
    floorName: floor?.name ?? "Floor pending",
    isAccessible: Boolean(item.isAccessible),
    href: floor ? `/editor/${floor.id}` : null,
  };
}
