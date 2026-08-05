import "server-only";

import { getPayload } from "payload";

import config from "@payload-config";
import { ROLES } from "@/collections/constants/roles";
import { asPayloadId, relationId } from "@/lib/payload-id";
import { tryCatchResponse } from "@/lib/responses/trycatch-response";
import type { User } from "@/payload-types";

import { BUILDINGS_CLIENT, NEW_FLOOR_DEFAULTS } from "../../constants/buildings.constants";
import { levelToBadge, levelToLabel, formatRelativeTime } from "../../lib/floorPresentation";
import type {
  BuildingEditData,
  BuildingListItem,
  DashboardFloor,
  FloorEditData,
  TCreateBuildingInput,
  TUpdateBuildingInput,
  TUpdateFloorMetadataInput,
} from "../../types/buildings.types";
import type { TCreateFloor, TSetFloorStatus } from "./buildings-mutations.types";

async function getPayloadClient() {
  return getPayload({ config });
}

export async function listBuildingsAdapter(user: User) {
  return tryCatchResponse<BuildingListItem[]>(async () => {
    const payload = await getPayloadClient();
    const organizationId = relationId(user.organization);
    if (organizationId === null) return [];

    // depth: 0 is enough — logoUrl is a plain field (denormalized by
    // createSyncMediaUrlHook), so no populate hop into `media` is needed.
    // select trims the doc to only what's mapped below.
    const result = await payload.find({
      collection: "buildings",
      depth: 0,
      limit: 0,
      pagination: false,
      select: { name: true, address: true, floorCount: true, logoUrl: true },
      sort: "name",
      where: { organization: { equals: organizationId } },
      user,
      overrideAccess: false,
    });

    return result.docs.map((building) => ({
      id: String(building.id),
      name: building.name,
      address: building.address ?? null,
      floorCount: building.floorCount ?? 0,
      logoUrl: building.logoUrl ?? null,
    }));
  });
}

export async function getBuildingForEditAdapter(user: User, buildingId: string) {
  return tryCatchResponse<BuildingEditData>(async () => {
    const payload = await getPayloadClient();

    // populate overrides Organizations' own defaultPopulate (which now
    // also includes logoUrl, added for the public landing page) down to
    // just the one field this screen actually reads.
    const building = await payload.findByID({
      collection: "buildings",
      id: asPayloadId(buildingId),
      depth: 1,
      select: {
        name: true,
        organization: true,
        address: true,
        contactEmail: true,
        contactPhone: true,
        website: true,
        floorCount: true,
        logo: true,
        logoUrl: true,
      },
      populate: { organizations: { name: true } },
      user,
      overrideAccess: false,
    });

    const canEdit = user.role === ROLES.OWNER || user.role === ROLES.MANAGER;
    const logoId = relationId(building.logo);
    const organization = typeof building.organization === "object" ? building.organization : null;

    return {
      id: String(building.id),
      name: building.name,
      organizationName: organization?.name ?? "",
      address: building.address ?? null,
      contactEmail: building.contactEmail ?? null,
      contactPhone: building.contactPhone ?? null,
      website: building.website ?? null,
      logoId: logoId === null ? null : String(logoId),
      logoUrl: building.logoUrl ?? null,
      floorCount: building.floorCount ?? 0,
      canEdit,
    };
  });
}

export async function createBuildingAdapter(user: User, input: TCreateBuildingInput) {
  return tryCatchResponse<BuildingListItem>(async () => {
    const payload = await getPayloadClient();
    const organizationId = relationId(user.organization);
    if (organizationId === null) throw new Error(BUILDINGS_CLIENT.ERROR_CREATE_FAILED);

    const building = await payload.create({
      collection: "buildings",
      select: { name: true, address: true, floorCount: true },
      user,
      overrideAccess: false,
      data: {
        name: input.name,
        organization: asPayloadId(organizationId),
        address: input.address || undefined,
        contactEmail: input.contactEmail || undefined,
        contactPhone: input.contactPhone || undefined,
        website: input.website || undefined,
      },
    });

    return {
      id: String(building.id),
      name: building.name,
      address: building.address ?? null,
      floorCount: building.floorCount ?? 0,
      logoUrl: null,
    };
  });
}

export async function updateBuildingAdapter(user: User, buildingId: string, input: TUpdateBuildingInput) {
  return tryCatchResponse<BuildingEditData>(async () => {
    const payload = await getPayloadClient();

    const data: {
      name: string;
      address?: string;
      contactEmail?: string;
      contactPhone?: string;
      website?: string;
      logo?: number | null;
    } = {
      name: input.name,
      address: input.address,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      website: input.website,
    };

    if (input.logoId) {
      data.logo = asPayloadId(input.logoId);
    } else if (input.removeLogo) {
      data.logo = null;
    }

    // populate overrides Organizations' own defaultPopulate (which now
    // also includes logoUrl, added for the public landing page) down to
    // just the one field this screen actually reads.
    const building = await payload.update({
      collection: "buildings",
      id: asPayloadId(buildingId),
      depth: 1,
      select: {
        name: true,
        organization: true,
        address: true,
        contactEmail: true,
        contactPhone: true,
        website: true,
        floorCount: true,
        logo: true,
        logoUrl: true,
      },
      populate: { organizations: { name: true } },
      user,
      overrideAccess: false,
      data,
    });

    const logoId = relationId(building.logo);
    const organization = typeof building.organization === "object" ? building.organization : null;
    const canEdit = user.role === ROLES.OWNER || user.role === ROLES.MANAGER;

    return {
      id: String(building.id),
      name: building.name,
      organizationName: organization?.name ?? "",
      address: building.address ?? null,
      contactEmail: building.contactEmail ?? null,
      contactPhone: building.contactPhone ?? null,
      website: building.website ?? null,
      logoId: logoId === null ? null : String(logoId),
      logoUrl: building.logoUrl ?? null,
      floorCount: building.floorCount ?? 0,
      canEdit,
    };
  });
}

export async function getBuildingFloorsViewAdapter(user: User, buildingId: string) {
  return tryCatchResponse<DashboardFloor[]>(async () => {
    const payload = await getPayloadClient();

    const floorsResult = await payload.find({
      collection: "floors",
      depth: 0,
      limit: 100,
      sort: "-level",
      where: { building: { equals: asPayloadId(buildingId) } },
      user,
      overrideAccess: false,
    });
    const floors = floorsResult.docs;

    const objectsResult = await payload.find({
      collection: "map-objects",
      depth: 0,
      limit: 5000,
      select: { type: true, floor: true },
      where: { building: { equals: asPayloadId(buildingId) } },
      user,
      overrideAccess: false,
    });

    const roomCounts = new Map<string, number>();
    const poiCounts = new Map<string, number>();
    for (const object of objectsResult.docs) {
      const floorId = relationId(object.floor);
      if (floorId === null) continue;
      const floorIdKey = String(floorId);
      if (object.type === "room") {
        roomCounts.set(floorIdKey, (roomCounts.get(floorIdKey) ?? 0) + 1);
      } else if (object.type === "poi") {
        poiCounts.set(floorIdKey, (poiCounts.get(floorIdKey) ?? 0) + 1);
      }
    }

    const now = Date.now();
    return floors.map((floor) => {
      const id = String(floor.id);
      const level = floor.level ?? 0;
      const isPublished = floor.status === "published";
      return {
        id,
        name: floor.name,
        level,
        levelLabel: levelToLabel(level),
        badge: levelToBadge(level),
        roomCount: roomCounts.get(id) ?? 0,
        poiCount: poiCounts.get(id) ?? 0,
        status: isPublished ? "published" : "draft",
        isPublished,
        updatedLabel: formatRelativeTime(floor.updatedAt, now),
      };
    });
  });
}

export async function createFloorAdapter(user: User, data: TCreateFloor) {
  const payload = await getPayloadClient();

  return tryCatchResponse(() =>
    payload.create({
      collection: "floors",
      user,
      overrideAccess: false,
      data: {
        building: asPayloadId(data.buildingId),
        name: data.name,
        level: data.level,
        width: NEW_FLOOR_DEFAULTS.width,
        height: NEW_FLOOR_DEFAULTS.height,
        status: data.publish ? "published" : "draft",
      },
    }),
  );
}

export async function setFloorStatusAdapter(user: User, { id, status }: TSetFloorStatus) {
  const payload = await getPayloadClient();

  return tryCatchResponse(() =>
    payload.update({
      collection: "floors",
      id: asPayloadId(id),
      user,
      overrideAccess: false,
      data: { status },
    }),
  );
}

function toFloorEditData(floor: {
  id: number | string;
  name: string;
  level?: number | null;
  width?: number | null;
  height?: number | null;
  metersPerPixel?: number | null;
  status: "draft" | "published";
  building: number | { id: number | string; name: string };
}): FloorEditData {
  const building = typeof floor.building === "object" ? floor.building : null;

  return {
    id: String(floor.id),
    buildingId: building ? String(building.id) : String(floor.building),
    buildingName: building?.name ?? "",
    name: floor.name,
    level: floor.level ?? 0,
    width: floor.width ?? 0,
    height: floor.height ?? 0,
    metersPerPixel: floor.metersPerPixel ?? null,
    status: floor.status,
  };
}

export async function getFloorForEditAdapter(user: User, floorId: string) {
  return tryCatchResponse<FloorEditData>(async () => {
    const payload = await getPayloadClient();

    const floor = await payload.findByID({
      collection: "floors",
      id: asPayloadId(floorId),
      depth: 1,
      user,
      overrideAccess: false,
    });

    return toFloorEditData(floor);
  });
}

export async function updateFloorMetadataAdapter(
  user: User,
  floorId: string,
  input: TUpdateFloorMetadataInput,
) {
  return tryCatchResponse<FloorEditData>(async () => {
    const payload = await getPayloadClient();

    const floor = await payload.update({
      collection: "floors",
      id: asPayloadId(floorId),
      depth: 1,
      user,
      overrideAccess: false,
      data: {
        name: input.name,
        level: input.level,
        width: input.width,
        height: input.height,
        metersPerPixel: input.metersPerPixel ?? undefined,
        status: input.status,
      },
    });

    return toFloorEditData(floor);
  });
}
