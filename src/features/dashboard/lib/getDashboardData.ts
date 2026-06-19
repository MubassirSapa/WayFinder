import { headers as getHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";

import config from "@payload-config";
import { PUBLIC_ROUTES } from "@/constants/routes";
import type { Floor, MapObject, Organization, User } from "@/payload-types";

import { DASHBOARD_CLIENT } from "../constants/dashboard.constants";
import type { DashboardData, DashboardFloor } from "../types/dashboard.types";
import {
  formatRelativeTime,
  levelToBadge,
  levelToLabel,
  organizationInitials,
  organizationTypeLabel,
} from "./floorPresentation";

function getRelationId(relation: unknown): string | null {
  if (relation === null || relation === undefined) return null;
  if (typeof relation === "object" && "id" in relation) {
    const id = (relation as { id: unknown }).id;
    return id === null || id === undefined ? null : String(id);
  }
  return String(relation);
}

export async function getDashboardData(): Promise<DashboardData> {
  const headers = await getHeaders();
  const payload = await getPayload({ config });

  const { user } = await payload.auth({ headers });
  if (!user) redirect(PUBLIC_ROUTES.SIGNIN);

  const currentUser = user as User;
  const organizationId = getRelationId(currentUser.organization);

  let organization: Organization | null = null;
  if (organizationId) {
    try {
      organization = await payload.findByID({
        collection: "organizations",
        id: organizationId,
        overrideAccess: true,
      });
    } catch {
      organization = null;
    }
  }

  const buildingId = organizationId ? `building-${organizationId}` : "building-default";

  const floorsResult = await payload.find({
    collection: "floors",
    depth: 0,
    limit: 100,
    overrideAccess: true,
    sort: "-level",
    where: { buildingId: { equals: buildingId } },
  });
  const floors = floorsResult.docs as Floor[];

  const objectsResult = await payload.find({
    collection: "map-objects",
    depth: 0,
    limit: 5000,
    overrideAccess: true,
    select: { type: true, floor: true },
    where: { buildingId: { equals: buildingId } },
  });

  const roomCounts = new Map<string, number>();
  const poiCounts = new Map<string, number>();
  for (const object of objectsResult.docs as MapObject[]) {
    const floorId = getRelationId(object.floor);
    if (!floorId) continue;
    if (object.type === "room") {
      roomCounts.set(floorId, (roomCounts.get(floorId) ?? 0) + 1);
    } else if (object.type === "poi") {
      poiCounts.set(floorId, (poiCounts.get(floorId) ?? 0) + 1);
    }
  }

  const now = Date.now();
  const viewFloors: DashboardFloor[] = floors.map((floor) => {
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

  const name = currentUser.name ?? "";
  const email = currentUser.email ?? "";
  const initial = (name.trim()[0] ?? email.trim()[0] ?? "A").toUpperCase();

  return {
    user: {
      name: name || email,
      email,
      initial,
    },
    organization: {
      id: organizationId,
      name: organization?.name ?? DASHBOARD_CLIENT.ORG_FALLBACK_NAME,
      initials: organizationInitials(organization?.name ?? DASHBOARD_CLIENT.ORG_FALLBACK_NAME),
      typeLabel: organizationTypeLabel(organization?.type),
    },
    floors: viewFloors,
    buildingId,
  };
}
