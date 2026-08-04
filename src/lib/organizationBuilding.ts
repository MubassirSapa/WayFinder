import "server-only";

import type { Organization } from "@/payload-types";

import { getPayloadClient } from "./getPayloadClient";
import { asPayloadId } from "./payload-id";

const BUILDING_ID_PREFIX = "building-";

// Until buildings have their own collection, dashboard floors encode the organization ID here.
export function parseOrganizationIdFromBuildingId(buildingId: string) {
  if (!buildingId.startsWith(BUILDING_ID_PREFIX)) {
    return null;
  }

  const id = buildingId.slice(BUILDING_ID_PREFIX.length);
  return id ? asPayloadId(id) : null;
}

export async function resolveOrganizationNamesByBuildingId(
  buildingIds: string[],
): Promise<Record<string, string>> {
  const organizations = await resolveOrganizationsByBuildingId(buildingIds);

  return Object.fromEntries(
    Object.entries(organizations).map(([buildingId, organization]) => [
      buildingId,
      organization.name,
    ]),
  );
}

export type OrganizationBuildingSummary = Pick<Organization, "name" | "type">;

export async function resolveOrganizationsByBuildingId(
  buildingIds: string[],
): Promise<Record<string, OrganizationBuildingSummary>> {
  const orgIdByBuildingId = new Map<string, ReturnType<typeof asPayloadId>>();

  for (const buildingId of new Set(buildingIds)) {
    const organizationId = parseOrganizationIdFromBuildingId(buildingId);
    if (organizationId !== null) {
      orgIdByBuildingId.set(buildingId, organizationId);
    }
  }

  if (orgIdByBuildingId.size === 0) {
    return {};
  }

  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "organizations",
    depth: 0,
    limit: orgIdByBuildingId.size,
    overrideAccess: true,
    where: {
      id: { in: Array.from(new Set(orgIdByBuildingId.values())) },
    },
  });

  const organizationById = new Map(
    result.docs.map((organization) => [
      String(organization.id),
      { name: organization.name, type: organization.type },
    ]),
  );
  const organizationsByBuildingId: Record<string, OrganizationBuildingSummary> = {};

  for (const [buildingId, organizationId] of orgIdByBuildingId) {
    const organization = organizationById.get(String(organizationId));
    if (organization) {
      organizationsByBuildingId[buildingId] = organization;
    }
  }

  return organizationsByBuildingId;
}
