import "server-only";

import config from "@payload-config";
import type { Building, Floor, Organization } from "@/payload-types";
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
  buildingAddress: string | null;
  buildingLogoUrl: string | null;
  organizationId: string;
  organizationName: string;
  organizationLogoUrl: string | null;
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
      // depth 2: floor -> building -> organization. No third hop into
      // `media` needed — logoUrl is a plain field on both Buildings and
      // Organizations (denormalized by createSyncMediaUrlHook from the
      // `logo` relation at write time), and it's already part of both
      // collections' defaultPopulate, so no populate override is needed
      // here either. This sidesteps the populate-restriction pitfall
      // documented in docs/technical/MEDIA_STORAGE.md entirely, rather than
      // working around it per-query.
      depth: 2,
      // select trims the directly-queried floor doc to only the fields this
      // page reads (id is always included regardless of select).
      select: {
        name: true,
        level: true,
        backgroundImageUrl: true,
        building: true,
        createdAt: true,
        updatedAt: true,
      },
      // Buildings.defaultPopulate omits `address` (most callers don't need
      // it) - override it for this query only, since the public venue cards
      // show a building's location. A populate override replaces
      // defaultPopulate entirely instead of merging with it, so every field
      // defaultPopulate would have included (`organization`, `logoUrl`) has
      // to be re-listed here too or it silently comes back undefined - this
      // is what caused venue cards to never show a building's own logo even
      // though the same field renders fine everywhere defaultPopulate is
      // left untouched.
      populate: {
        buildings: { name: true, organization: true, address: true, logoUrl: true },
      },
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

      const organization =
        typeof building === "object" && typeof building.organization === "object"
          ? (building.organization as Organization)
          : null;
      const organizationId = relationId(typeof building === "object" ? building.organization : null);

      groups.set(key, {
        buildingId: key,
        buildingName: typeof building === "object" ? building.name : key,
        buildingAddress: (typeof building === "object" ? building.address : null) ?? null,
        buildingLogoUrl: (typeof building === "object" ? building.logoUrl : null) ?? null,
        organizationId: organizationId === null ? "" : String(organizationId),
        organizationName: organization?.name ?? "",
        organizationLogoUrl: organization?.logoUrl ?? null,
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
    address: group.buildingAddress,
    backgroundImageUrl: primaryFloor.backgroundImageUrl ?? null,
    logoUrl: group.buildingLogoUrl,
    organizationId: group.organizationId,
    organizationName: group.organizationName,
    organizationLogoUrl: group.organizationLogoUrl,
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
