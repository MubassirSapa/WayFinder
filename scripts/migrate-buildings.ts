import { readFile } from "node:fs/promises";

import { getPayload, type Payload } from "payload";

import config from "../src/payload.config";
import { ROLES } from "../src/collections/constants/roles";

// One-time backfill for the pre-Buildings-collection era, where floors,
// map-objects, map-nodes, and path-edges each carried a free-text
// `buildingId` field encoding "building-<organizationId>" instead of a real
// relationship. That field has since been removed from the collection
// configs, so this reads the legacy (id -> buildingId) pairs from
// migration-data/legacy-building-ids.json — captured directly from the dev
// database before the field was dropped — rather than from Payload itself.
const LEGACY_BUILDING_ID_PATTERN = /^building-(\d+)$/;
const MAP_COLLECTIONS = ["floors", "map-objects", "map-nodes", "path-edges"] as const;
type MapCollection = (typeof MAP_COLLECTIONS)[number];

type LegacyRow = { id: number; buildingId: string };
type LegacyData = Record<"floors" | "mapObjects" | "mapNodes" | "pathEdges", LegacyRow[]>;

const LEGACY_DATA_KEY: Record<MapCollection, keyof LegacyData> = {
  floors: "floors",
  "map-objects": "mapObjects",
  "map-nodes": "mapNodes",
  "path-edges": "pathEdges",
};

type OrganizationDoc = { id: number; name: string };

function isNotFoundError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { status?: unknown; statusCode?: unknown };
  return candidate.status === 404 || candidate.statusCode === 404;
}

async function loadLegacyData(): Promise<LegacyData> {
  const fileUrl = new URL("./migration-data/legacy-building-ids.json", import.meta.url);
  return JSON.parse(await readFile(fileUrl, "utf8")) as LegacyData;
}

async function upsertBuildingForOrganization(
  payload: Payload,
  organization: OrganizationDoc,
  cache: Map<number, number>,
): Promise<number> {
  const cached = cache.get(organization.id);
  if (cached !== undefined) return cached;

  const existing = await payload.find({
    collection: "buildings",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { organization: { equals: organization.id } },
  });

  const buildingId = existing.docs[0]
    ? existing.docs[0].id
    : (
        await payload.create({
          collection: "buildings",
          overrideAccess: true,
          data: { name: organization.name, organization: organization.id },
        })
      ).id;

  cache.set(organization.id, buildingId);
  return buildingId;
}

async function migrateCollection(
  payload: Payload,
  collection: MapCollection,
  rows: LegacyRow[],
  organizationsById: Map<number, OrganizationDoc>,
  buildingByOrganizationId: Map<number, number>,
) {
  let repointed = 0;
  let deleted = 0;
  let alreadyGone = 0;

  for (const row of rows) {
    const match = row.buildingId.match(LEGACY_BUILDING_ID_PATTERN);
    const organization = match ? organizationsById.get(Number(match[1])) : undefined;

    // Re-running this script is safe: a row already deleted/repointed by a
    // prior run simply throws "not found" here, which we treat as done.
    try {
      if (!organization) {
        payload.logger.warn(
          `${collection} #${row.id}: no organization matches legacy buildingId "${row.buildingId}" — deleting.`,
        );
        await payload.delete({ collection, id: row.id, overrideAccess: true });
        deleted += 1;
        continue;
      }

      const buildingId = await upsertBuildingForOrganization(payload, organization, buildingByOrganizationId);
      await payload.update({
        collection,
        id: row.id,
        overrideAccess: true,
        data: { building: buildingId },
      });
      repointed += 1;
    } catch (error) {
      if (isNotFoundError(error)) {
        alreadyGone += 1;
        continue;
      }

      payload.logger.error({ err: error, msg: `${collection} #${row.id}: migration failed` });
      throw error;
    }
  }

  payload.logger.info(
    `${collection}: ${repointed} repointed, ${deleted} deleted (no matching organization), ${alreadyGone} already handled by a prior run.`,
  );
}

async function assignRoles(payload: Payload, organization: OrganizationDoc, buildingId: number | undefined) {
  const usersResult = await payload.find({
    collection: "users",
    depth: 0,
    limit: 0,
    pagination: false,
    overrideAccess: true,
    sort: "createdAt",
    where: { organization: { equals: organization.id } },
  });

  const [owner, ...members] = usersResult.docs;
  if (!owner) return;

  await payload.update({
    collection: "users",
    id: owner.id,
    overrideAccess: true,
    data: { role: ROLES.OWNER },
  });

  for (const member of members) {
    await payload.update({
      collection: "users",
      id: member.id,
      overrideAccess: true,
      data: {
        role: ROLES.MEMBER,
        buildings: buildingId !== undefined ? [buildingId] : undefined,
      },
    });
  }
}

async function run() {
  const legacyData = await loadLegacyData();
  const payload = await getPayload({ config });

  try {
    const organizationsResult = await payload.find({
      collection: "organizations",
      depth: 0,
      limit: 0,
      pagination: false,
      overrideAccess: true,
    });
    const organizationsById = new Map(organizationsResult.docs.map((org) => [org.id, org]));
    const buildingByOrganizationId = new Map<number, number>();

    // Delete children before parents so no dangling relationship values remain
    // for rows whose legacy buildingId doesn't match any organization.
    for (const collection of [...MAP_COLLECTIONS].reverse()) {
      await migrateCollection(
        payload,
        collection,
        legacyData[LEGACY_DATA_KEY[collection]],
        organizationsById,
        buildingByOrganizationId,
      );
    }

    for (const organization of organizationsById.values()) {
      await assignRoles(payload, organization, buildingByOrganizationId.get(organization.id));
    }

    payload.logger.info(`Buildings migration complete: ${buildingByOrganizationId.size} building(s) created/matched.`);
    payload.logger.info(
      "Next: flip `building` to required: true on floors/map-objects/map-nodes/path-edges, then regenerate types.",
    );
  } finally {
    await payload.destroy();
  }
}

await run();
