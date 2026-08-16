import { readFile } from "node:fs/promises";

import { getPayload, type DefaultDocumentIDType, type Payload } from "payload";

import config from "../src/payload.config";
import { relationId } from "../src/lib/payload-id";

const DEMO_PASSWORD = process.env.DEMO_SEED_PASSWORD;
if (!DEMO_PASSWORD) {
  throw new Error("Missing DEMO_SEED_PASSWORD. Set it in the selected environment file before seeding.");
}

// Payload owns adapter-specific ID creation and validation. Seeded IDs always
// come directly from Local API results; never synthesize or coerce them here.
type PayloadId = DefaultDocumentIDType;

type MongoExportId = { $oid: string };

interface ExportDocument {
  _id: MongoExportId;
  buildingId: string;
  createdAt: { $date: string };
  updatedAt: { $date: string };
  __v: number;
}

interface FloorExport extends ExportDocument {
  name: string;
  level: number;
  width: number;
  height: number;
  metersPerPixel?: number;
  backgroundImageRotation?: number;
  backgroundImageScale?: number;
  backgroundImageOpacity?: number;
  backgroundImageLocked?: boolean;
  backgroundImageVisible?: boolean;
  backgroundImageOffsetX?: number;
  backgroundImageOffsetY?: number;
  backgroundImageFit?: "fill" | "cover" | "contain";
  status: "draft" | "published";
}

interface MapObjectExport extends ExportDocument {
  floor: MongoExportId;
  parentObject?: MongoExportId | null;
  type: "room" | "wall" | "door" | "hallway" | "stairs" | "elevator" | "escalator" | "washroom" | "exit" | "poi" | "aisle" | "shelf" | "section";
  name: string;
  label?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  shape?: "rectangle" | "ellipse" | "polygon";
  points?: Array<{ x: number; y: number }>;
  isSearchable?: boolean;
  isAccessible?: boolean;
}

interface MapNodeExport extends ExportDocument {
  floor: MongoExportId;
  object?: MongoExportId | null;
  role: "entrance" | "exit" | "hallway_point" | "stairs_entry" | "elevator_entry" | "escalator_entry" | "shelf_access";
  label?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  geometryType: "rectangle" | "polygon" | "line" | "icon";
  points?: Array<{ x: number; y: number }>;
  isAccessible?: boolean;
}

interface PathEdgeExport extends ExportDocument {
  floor: MongoExportId;
  fromNode: MongoExportId;
  toNode: MongoExportId;
  type: "walkway" | "stairs" | "elevator" | "escalator" | "ramp";
  distanceMeters: number;
  bidirectional?: boolean;
  isAccessible?: boolean;
}

interface DemoSeed {
  sourceBuildingId: string;
  user: { name: string; email: string };
  organization: { name: string; type: "hospital" | "mall"; approved: true };
}

interface SeededFloor {
  id: PayloadId;
  width: number;
  height: number;
}

interface SeededNode {
  id: PayloadId;
  floorId: PayloadId;
  role: MapNodeExport["role"];
  x: number;
  y: number;
}

const CONNECTORS = [
  { role: "stairs_entry", objectType: "stairs", edgeType: "stairs", label: "Test Stairs", accessible: false },
  { role: "elevator_entry", objectType: "elevator", edgeType: "elevator", label: "Test Elevator", accessible: true },
  { role: "escalator_entry", objectType: "escalator", edgeType: "escalator", label: "Test Escalator", accessible: false },
] as const;

const DEMOS: DemoSeed[] = [
  {
    sourceBuildingId: "building-6a6d3e83b738407e8484c9be",
    user: { name: "Hasan", email: "hasan.swe.dev@gmail.com" },
    organization: { name: "Northstar Medical Centre", type: "hospital", approved: true },
  },
  {
    sourceBuildingId: "building-6a6d3dfdb738407e8484c98d",
    user: { name: "Mubassir", email: "mubs4edu@gmail.com" },
    organization: { name: "Harbourfront Galleria", type: "mall", approved: true },
  },
];

const fixtureUrl = (name: string) => new URL(`./seed-data/${name}.json`, import.meta.url);

async function readFixture<T>(name: string): Promise<T[]> {
  return normalizeExtendedNumbers(JSON.parse(await readFile(fixtureUrl(name), "utf8"))) as T[];
}

function normalizeExtendedNumbers(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeExtendedNumbers);
  }
  if (!value || typeof value !== "object") {
    return value;
  }

  const record = value as Record<string, unknown>;
  if (typeof record.$numberDouble === "string") {
    return Number(record.$numberDouble);
  }

  return Object.fromEntries(
    Object.entries(record).map(([key, child]) => [key, normalizeExtendedNumbers(child)]),
  );
}

function exportedId(value: MongoExportId): string {
  return value.$oid;
}

function requireMappedId(map: Map<string, PayloadId>, sourceId: MongoExportId, relation: string): PayloadId {
  const id = map.get(exportedId(sourceId));
  if (id === undefined) {
    throw new Error(`Seed fixture contains an unresolved ${relation} reference: ${exportedId(sourceId)}`);
  }
  return id;
}

function withoutExportMetadata<T extends ExportDocument>(document: T): Omit<T, "_id" | "buildingId" | "createdAt" | "updatedAt" | "__v"> {
  const { _id: _id, buildingId: _buildingId, createdAt: _createdAt, updatedAt: _updatedAt, __v: _version, ...data } = document;
  void [_id, _buildingId, _createdAt, _updatedAt, _version];
  return data;
}

async function upsertOrganization(payload: Payload, demo: DemoSeed) {
  const existingUser = await payload.find({
    collection: "users",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { email: { equals: demo.user.email } },
  });
  const existingOrganizationId = relationId(existingUser.docs[0]?.organization);

  if (existingOrganizationId !== null) {
    const organization = await payload.update({
      collection: "organizations",
      id: existingOrganizationId,
      depth: 0,
      overrideAccess: true,
      data: { approved: true },
    });
    return { organization, existingUser: existingUser.docs[0] };
  }

  const existing = await payload.find({
    collection: "organizations",
    limit: 1,
    overrideAccess: true,
    where: { name: { equals: demo.organization.name } },
  });

  const organization = await (existing.docs[0]
    ? payload.update({
        collection: "organizations",
        id: existing.docs[0].id,
        overrideAccess: true,
        data: demo.organization,
      })
    : payload.create({
        collection: "organizations",
        overrideAccess: true,
        data: demo.organization,
      }));

  return { organization, existingUser: undefined };
}

async function upsertUser(
  payload: Payload,
  demo: DemoSeed,
  organizationId: PayloadId,
  existingUserId?: PayloadId,
) {
  const data = {
    ...demo.user,
    password: DEMO_PASSWORD,
    role: "owner" as const,
    organization: organizationId,
    _verified: true,
  };

  if (existingUserId !== undefined) {
    await payload.update({
      collection: "users",
      id: existingUserId,
      overrideAccess: true,
      data,
    });
    return;
  }

  await payload.create({
    collection: "users",
    overrideAccess: true,
    disableVerificationEmail: true,
    data,
  });
}

async function upsertBuilding(payload: Payload, organizationId: PayloadId, buildingName: string) {
  const existing = await payload.find({
    collection: "buildings",
    limit: 1,
    overrideAccess: true,
    where: { organization: { equals: organizationId } },
  });

  return existing.docs[0]
    ? payload.update({
        collection: "buildings",
        id: existing.docs[0].id,
        overrideAccess: true,
        data: { name: buildingName },
      })
    : payload.create({
        collection: "buildings",
        overrideAccess: true,
        data: { name: buildingName, organization: organizationId },
      });
}

async function clearBuilding(payload: Payload, buildingId: PayloadId) {
  for (const collection of ["path-edges", "map-nodes", "map-objects", "floors"] as const) {
    await payload.delete({
      collection,
      overrideAccess: true,
      where: { building: { equals: buildingId } },
    });
  }
}

async function seedDemo(payload: Payload, demo: DemoSeed, fixtures: {
  floors: FloorExport[];
  objects: MapObjectExport[];
  nodes: MapNodeExport[];
  edges: PathEdgeExport[];
}) {
  const { organization, existingUser } = await upsertOrganization(payload, demo);
  await upsertUser(payload, demo, organization.id, existingUser?.id);
  const building = await upsertBuilding(payload, organization.id, organization.name);

  const buildingId = building.id;
  await clearBuilding(payload, buildingId);

  const floorIds = new Map<string, PayloadId>();
  const objectIds = new Map<string, PayloadId>();
  const nodeIds = new Map<string, PayloadId>();
  const seededFloors: SeededFloor[] = [];
  const seededNodes: SeededNode[] = [];
  let createdObjectCount = 0;
  let createdEdgeCount = 0;
  const belongsToDemo = <T extends ExportDocument>(document: T) => document.buildingId === demo.sourceBuildingId;

  for (const [index, source] of fixtures.floors.filter(belongsToDemo).entries()) {
    const floor = await payload.create({
      collection: "floors",
      overrideAccess: true,
      data: {
        ...withoutExportMetadata(source),
        building: buildingId,
        name: `Floor ${index + 1}`,
        level: index + 1,
        status: "published",
      },
    });
    floorIds.set(exportedId(source._id), floor.id);
    seededFloors.push({ id: floor.id, width: source.width, height: source.height });
  }

  for (const source of fixtures.objects.filter(belongsToDemo)) {
    const { floor, parentObject, ...data } = withoutExportMetadata(source);
    const object = await payload.create({
      collection: "map-objects",
      overrideAccess: true,
      data: {
        ...data,
        building: buildingId,
        floor: requireMappedId(floorIds, floor, "floor"),
        ...(parentObject ? { parentObject: requireMappedId(objectIds, parentObject, "parent object") } : {}),
      },
    });
    objectIds.set(exportedId(source._id), object.id);
    createdObjectCount += 1;
  }

  for (const source of fixtures.nodes.filter(belongsToDemo)) {
    const { floor, object, ...data } = withoutExportMetadata(source);
    const node = await payload.create({
      collection: "map-nodes",
      overrideAccess: true,
      data: {
        ...data,
        building: buildingId,
        floor: requireMappedId(floorIds, floor, "floor"),
        ...(object ? { object: requireMappedId(objectIds, object, "map object") } : {}),
      },
    });
    nodeIds.set(exportedId(source._id), node.id);
    seededNodes.push({ id: node.id, floorId: requireMappedId(floorIds, floor, "floor"), role: source.role, x: source.x, y: source.y });
  }

  for (const source of fixtures.edges.filter(belongsToDemo)) {
    const { floor, fromNode, toNode, ...data } = withoutExportMetadata(source);
    const sourceFromNode = fixtures.nodes.find((node) => exportedId(node._id) === exportedId(fromNode));
    const sourceToNode = fixtures.nodes.find((node) => exportedId(node._id) === exportedId(toNode));
    if (sourceFromNode && sourceToNode && exportedId(sourceFromNode.floor) !== exportedId(sourceToNode.floor)) {
      continue;
    }
    await payload.create({
      collection: "path-edges",
      overrideAccess: true,
      data: {
        ...data,
        building: buildingId,
        floor: requireMappedId(floorIds, floor, "floor"),
        fromNode: requireMappedId(nodeIds, fromNode, "from node"),
        toNode: requireMappedId(nodeIds, toNode, "to node"),
      },
    });
    createdEdgeCount += 1;
  }

  for (const floor of seededFloors) {
    for (const [connectorIndex, connector] of CONNECTORS.entries()) {
      if (seededNodes.some((node) => node.floorId === floor.id && node.role === connector.role)) {
        continue;
      }

      const x = floor.width - 100;
      const y = Math.min(floor.height - 100, 140 + connectorIndex * 120);
      const object = await payload.create({
        collection: "map-objects",
        overrideAccess: true,
        data: {
          building: buildingId,
          floor: floor.id,
          type: connector.objectType,
          name: connector.label,
          x: x - 35,
          y: y - 35,
          width: 70,
          height: 70,
          rotation: 0,
          shape: "rectangle",
          isSearchable: false,
          isAccessible: connector.accessible,
        },
      });
      createdObjectCount += 1;

      const node = await payload.create({
        collection: "map-nodes",
        overrideAccess: true,
        data: {
          building: buildingId,
          floor: floor.id,
          object: object.id,
          role: connector.role,
          label: connector.label,
          x,
          y,
          rotation: 0,
          geometryType: "icon",
          isAccessible: connector.accessible,
        },
      });
      const seededNode: SeededNode = { id: node.id, floorId: floor.id, role: connector.role, x, y };
      seededNodes.push(seededNode);

      const routeNode = seededNodes
        .filter((candidate) => candidate.floorId === floor.id && ["hallway_point", "entrance"].includes(candidate.role))
        .sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0];
      if (!routeNode) {
        throw new Error(`Floor ${floor.id} has no route node for ${connector.label}`);
      }
      await payload.create({
        collection: "path-edges",
        overrideAccess: true,
        data: {
          building: buildingId,
          floor: floor.id,
          fromNode: node.id,
          toNode: routeNode.id,
          type: "walkway",
          distanceMeters: Math.max(1, Math.round(Math.hypot(routeNode.x - x, routeNode.y - y) * 0.05)),
          bidirectional: true,
          isAccessible: connector.accessible,
        },
      });
      createdEdgeCount += 1;
    }
  }

  for (let floorIndex = 0; floorIndex < seededFloors.length - 1; floorIndex += 1) {
    const fromFloor = seededFloors[floorIndex];
    const toFloor = seededFloors[floorIndex + 1];
    for (const connector of CONNECTORS) {
      const fromNode = seededNodes.find((node) => node.floorId === fromFloor.id && node.role === connector.role);
      const toNode = seededNodes.find((node) => node.floorId === toFloor.id && node.role === connector.role);
      if (!fromNode || !toNode) {
        throw new Error(`Cannot connect floors ${fromFloor.id} and ${toFloor.id} using ${connector.edgeType}`);
      }
      await payload.create({
        collection: "path-edges",
        overrideAccess: true,
        data: {
          building: buildingId,
          floor: fromFloor.id,
          fromNode: fromNode.id,
          toNode: toNode.id,
          type: connector.edgeType,
          distanceMeters: connector.edgeType === "elevator" ? 5 : 4,
          bidirectional: true,
          isAccessible: connector.accessible,
        },
      });
      createdEdgeCount += 1;
    }
  }

  return {
    buildingId,
    email: demo.user.email,
    floorCount: floorIds.size,
    objectCount: createdObjectCount,
    nodeCount: seededNodes.length,
    edgeCount: createdEdgeCount,
    organization: organization.name,
  };
}

const payload = await getPayload({ config });

try {
  const fixtures = {
    floors: await readFixture<FloorExport>("floors"),
    objects: await readFixture<MapObjectExport>("map-objects"),
    nodes: await readFixture<MapNodeExport>("map-nodes"),
    edges: await readFixture<PathEdgeExport>("path-edges"),
  };
  const results = [];

  for (const demo of DEMOS) {
    results.push(await seedDemo(payload, demo, fixtures));
  }

  payload.logger.info("Demo data is ready (running this command again safely refreshes it).\n");
  for (const result of results) {
    payload.logger.info(`${result.organization}: ${result.floorCount} floors, ${result.objectCount} objects, ${result.nodeCount} nodes, ${result.edgeCount} edges (${result.buildingId})`);
    payload.logger.info(`  Email: ${result.email}`);
  }
} finally {
  await payload.destroy();
}
