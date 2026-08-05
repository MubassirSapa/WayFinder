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
      // depth 3: floor -> building -> organization -> logo, so the venue
      // name, building logo, and organization (with its own logo) all
      // resolve without extra round trips.
      depth: 3,
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
      // populate overrides each populated relation's own fields — Buildings'
      // defaultPopulate doesn't include `logo`, so both it and
      // `organizations` need a per-query override here. Deliberately NOT
      // restricting `media` the same way: verified empirically that
      // Payload's `url` field on an upload collection is computed at read
      // time and needs the doc's other upload fields (at least `filename`)
      // present to resolve — selecting only `{ url: true }` on the
      // populated media doc silently returns `url: null`. Media has no
      // `defaultPopulate` yet (see docs/technical/MEDIA_STORAGE.md's
      // follow-up note); adding one needs to include whatever the url hook
      // depends on, not just `url` itself.
      populate: {
        buildings: { name: true, logo: true, organization: true },
        organizations: { name: true, logo: true },
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

      const logo = typeof building === "object" && building.logo && typeof building.logo === "object" ? building.logo : null;
      const organization =
        typeof building === "object" && typeof building.organization === "object"
          ? (building.organization as Organization)
          : null;
      const organizationLogo =
        organization?.logo && typeof organization.logo === "object" ? organization.logo : null;
      const organizationId = relationId(typeof building === "object" ? building.organization : null);

      groups.set(key, {
        buildingId: key,
        buildingName: typeof building === "object" ? building.name : key,
        buildingLogoUrl: logo?.url ?? null,
        organizationId: organizationId === null ? "" : String(organizationId),
        organizationName: organization?.name ?? "",
        organizationLogoUrl: organizationLogo?.url ?? null,
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
