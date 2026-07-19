import "server-only";

import { getPayloadClient } from "./getPayloadClient";

const BUILDING_ID_PREFIX = "building-";

// Floor.buildingId (and MapObject/MapNode/PathEdge's copies of it) is a
// free-text field, but every value in practice is written as
// `building-${organizationId}` by src/features/dashboard/lib/getDashboardData.ts
// when an admin creates a floor — there's no real "building" collection,
// one Organization maps to exactly one buildingId. This recovers that
// numeric id so the real Organization.name can be looked up, instead of
// just reformatting the raw "building-4" string into "Building 4".
export function parseOrganizationIdFromBuildingId(buildingId: string): number | null {
  if (!buildingId.startsWith(BUILDING_ID_PREFIX)) {
    return null;
  }

  const id = Number(buildingId.slice(BUILDING_ID_PREFIX.length));
  return Number.isFinite(id) ? id : null;
}

// Batch-resolves real Organization names for a set of buildingId strings in
// a single query, so callers looping over many floors/venues don't do it
// per-item. Falls back to omitting a key entirely when a buildingId doesn't
// encode a real organization id, or that organization no longer exists —
// callers should fall back to their own generic label in that case.
export async function resolveOrganizationNamesByBuildingId(
  buildingIds: string[],
): Promise<Record<string, string>> {
  const orgIdByBuildingId = new Map<string, number>();

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

  const nameById = new Map(result.docs.map((organization) => [organization.id, organization.name]));
  const namesByBuildingId: Record<string, string> = {};

  for (const [buildingId, organizationId] of orgIdByBuildingId) {
    const name = nameById.get(organizationId);
    if (name) {
      namesByBuildingId[buildingId] = name;
    }
  }

  return namesByBuildingId;
}
