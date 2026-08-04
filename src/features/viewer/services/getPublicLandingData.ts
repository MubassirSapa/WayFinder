import "server-only";

import config from "@payload-config";
import type { Building, Floor } from "@/payload-types";
import { getPayload } from "payload";

import type {
  LandingFloor,
  LandingVenue,
  PublicLandingData,
} from "@/features/viewer/types";
import { relationId } from "@/lib/payload-id";

type VenueGroup = {
  buildingId: string;
  buildingName: string;
  floors: Floor[];
};

async function getPayloadClient() {
  return getPayload({ config });
}

export async function getPublicLandingData(): Promise<PublicLandingData> {
  try {
    const payload = await getPayloadClient();

    const floorsResult = await payload.find({
      collection: "floors",
      // depth 1: floor -> building, so the venue name resolves without a
      // second round trip.
      depth: 1,
      overrideAccess: true,
      pagination: false,
      sort: "-updatedAt",
      where: {
        status: {
          equals: "published",
        },
      },
    });

    const floors = floorsResult.docs as Floor[];
    const groups = new Map<string, VenueGroup>();

    for (const floor of floors) {
      const building = floor.building as Building | number;
      const buildingId = relationId(building);
      if (buildingId === null) continue;

      const key = String(buildingId);
      const existing = groups.get(key);

      if (existing) {
        existing.floors.push(floor);
        continue;
      }

      groups.set(key, {
        buildingId: key,
        buildingName: typeof building === "object" ? building.name : key,
        floors: [floor],
      });
    }

    const venues = Array.from(groups.values())
      .map(toLandingVenue)
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      venues,
      isAvailable: true,
    };
  } catch (error) {
    console.error("Failed to load public landing data:", error);

    return {
      venues: [],
      isAvailable: false,
    };
  }
}

function toLandingVenue(group: VenueGroup): LandingVenue {
  const floors = [...group.floors]
    .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name))
    .map(toLandingFloor);
  const primaryFloor = [...group.floors].sort(
    (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
  )[0];
  const newestFloor = [...group.floors].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  )[0];

  return {
    id: group.buildingId,
    name: group.buildingName,
    backgroundImageUrl: primaryFloor.backgroundImageUrl ?? null,
    addedAt: newestFloor.createdAt,
    href: floors[0].href,
    floors,
  };
}

function toLandingFloor(floor: Floor): LandingFloor {
  return {
    id: String(floor.id),
    name: floor.name,
    level: floor.level,
    href: `/map/${floor.id}`,
  };
}
