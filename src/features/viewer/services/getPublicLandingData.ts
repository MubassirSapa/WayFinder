import "server-only";

import config from "@payload-config";
import type { Floor } from "@/payload-types";
import { getPayload } from "payload";

import { formatBuildingName } from "@/features/viewer/lib/format";
import type {
  LandingFloor,
  LandingVenue,
  PublicLandingData,
} from "@/features/viewer/types";
import {
  resolveOrganizationsByBuildingId,
  type OrganizationBuildingSummary,
} from "@/lib/organizationBuilding";

type VenueGroup = {
  buildingId: string;
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
      depth: 0,
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
      const existing = groups.get(floor.buildingId);

      if (existing) {
        existing.floors.push(floor);
        continue;
      }

      groups.set(floor.buildingId, {
        buildingId: floor.buildingId,
        floors: [floor],
      });
    }

    const organizationsByBuildingId = await resolveOrganizationsByBuildingId(
      floors.map((floor) => floor.buildingId),
    );

    const venues = Array.from(groups.values())
      .map((group) => toLandingVenue(group, organizationsByBuildingId))
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

function toLandingVenue(
  group: VenueGroup,
  organizationsByBuildingId: Record<string, OrganizationBuildingSummary>,
): LandingVenue {
  const floors = [...group.floors]
    .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name))
    .map(toLandingFloor);
  const primaryFloor = [...group.floors].sort(
    (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
  )[0];
  const newestFloor = [...group.floors].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  )[0];
  const organization = organizationsByBuildingId[group.buildingId];

  return {
    id: group.buildingId,
    name: organization?.name ?? formatBuildingName(group.buildingId),
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
