import type {
  Building,
  Floor,
  MapNode,
  MapObject,
  Organization,
  PathEdge,
} from "@/payload-types";
import { getPayloadClient } from "@/lib/getPayloadClient";
import { asPayloadId } from "@/lib/payload-id";

import type {
  MapViewerData,
  ViewerFloor,
  ViewerMapNode,
  ViewerMapObject,
  ViewerPathEdge,
} from "../types/map-viewer.types";

type RelationValue = number | string | { id: number | string } | null | undefined;

function hasNumericOrStringId(value: unknown): value is { id: number | string } {
  return (
    typeof value === "object"
    && value !== null
    && "id" in value
    && (typeof value.id === "number" || typeof value.id === "string")
  );
}

function getRelationId(relation: RelationValue): string | null {
  if (relation === null || relation === undefined) return null;
  if (hasNumericOrStringId(relation)) return String(relation.id);
  return String(relation);
}

function getRequiredRelationId(relation: Exclude<RelationValue, null | undefined>) {
  if (hasNumericOrStringId(relation)) return String(relation.id);
  return String(relation);
}

function organizationNameFromFloor(doc: Floor): string | null {
  const building = doc.building as Building | number;
  if (!building || typeof building !== "object") return null;

  const organization = building.organization as Organization | number | null | undefined;
  if (!organization || typeof organization !== "object") return null;

  return organization.name ?? null;
}

function normalizeFloor(doc: Floor): ViewerFloor {
  const floorDoc = doc as Floor & { metersPerPixel?: number | null };

  return {
    id: String(doc.id),
    buildingId: getRequiredRelationId(doc.building),
    organizationName: organizationNameFromFloor(doc),
    name: doc.name,
    level: doc.level ?? 0,
    width: doc.width ?? 1200,
    height: doc.height ?? 800,
    metersPerPixel: floorDoc.metersPerPixel ?? null,
    status: doc.status ?? "draft",
  };
}

function normalizeObject(doc: MapObject): ViewerMapObject {
  return {
    id: String(doc.id),
    floorId: getRequiredRelationId(doc.floor),
    buildingId: getRequiredRelationId(doc.building),
    parentObjectId: getRelationId(doc.parentObject),
    type: doc.type,
    name: doc.name,
    label: doc.label ?? "",
    x: doc.x ?? 0,
    y: doc.y ?? 0,
    width: doc.width ?? 100,
    height: doc.height ?? 80,
    rotation: doc.rotation ?? 0,
    shape: doc.shape ?? "rectangle",
    points: doc.points?.map((point) => ({ x: point.x, y: point.y })) ?? null,
    isSearchable: doc.isSearchable ?? true,
    isAccessible: doc.isAccessible ?? true,
  };
}

function normalizeNode(doc: MapNode): ViewerMapNode {
  return {
    id: String(doc.id),
    floorId: getRequiredRelationId(doc.floor),
    buildingId: getRequiredRelationId(doc.building),
    objectId: getRelationId(doc.object),
    role: doc.role,
    label: doc.label ?? "",
    x: doc.x ?? 0,
    y: doc.y ?? 0,
    width: doc.width ?? undefined,
    height: doc.height ?? undefined,
    rotation: doc.rotation ?? undefined,
    geometryType: doc.geometryType ?? "icon",
    points: doc.points?.map((point) => ({
      id: point.id ? String(point.id) : null,
      x: point.x,
      y: point.y,
    })) ?? null,
    isAccessible: doc.isAccessible ?? true,
  };
}

function normalizeEdge(doc: PathEdge): ViewerPathEdge {
  return {
    id: String(doc.id),
    floorId: getRequiredRelationId(doc.floor),
    buildingId: getRequiredRelationId(doc.building),
    fromNodeId: getRequiredRelationId(doc.fromNode),
    toNodeId: getRequiredRelationId(doc.toNode),
    type: doc.type ?? "walkway",
    distanceMeters: doc.distanceMeters ?? 0,
    bidirectional: doc.bidirectional ?? true,
    isAccessible: doc.isAccessible ?? true,
  };
}

export async function getMapViewerData(floorId?: string): Promise<MapViewerData> {
  const payload = await getPayloadClient();

  let buildingId: string | undefined;
  if (floorId) {
    const requestedFloor = await payload
      .findByID({
        id: floorId,
        collection: "floors",
        depth: 0,
        overrideAccess: true,
      })
      .catch(() => null);
    buildingId = getRelationId(requestedFloor?.building) ?? undefined;
  }

  const floorsResult = await payload.find({
    collection: "floors",
    // depth 2: floor -> building -> building.organization, so the venue name
    // resolves without a second round trip.
    depth: 2,
    limit: 100,
    overrideAccess: true,
    sort: "level",
    where: {
      and: [
        { status: { equals: "published" } },
        ...(buildingId ? [{ building: { equals: buildingId } }] : []),
      ],
    },
  });

  const floors = floorsResult.docs.map((doc) => normalizeFloor(doc));

  if (floors.length === 0) {
    return {
      edgesByFloorId: {},
      floors: [],
      initialFloorId: null,
      nodesByFloorId: {},
      objectsByFloorId: {},
    };
  }

  const floorsWithData = await Promise.all(
    floors.map(async (floor) => {
      const [objectsResult, nodesResult, edgesResult] = await Promise.all([
        payload.find({
          collection: "map-objects",
          depth: 0,
          limit: 1000,
          overrideAccess: true,
          sort: "name",
          where: {
            floor: {
              equals: asPayloadId(floor.id),
            },
          },
        }),
        payload.find({
          collection: "map-nodes",
          depth: 0,
          limit: 1000,
          overrideAccess: true,
          where: {
            floor: {
              equals: asPayloadId(floor.id),
            },
          },
        }),
        payload.find({
          collection: "path-edges",
          depth: 0,
          limit: 1000,
          overrideAccess: true,
          where: {
            floor: {
              equals: asPayloadId(floor.id),
            },
          },
        }),
      ]);

      return {
        edgeList: edgesResult.docs.map(normalizeEdge),
        floorId: floor.id,
        nodeList: nodesResult.docs.map(normalizeNode),
        objectList: objectsResult.docs.map(normalizeObject),
      };
    }),
  );

  return {
    edgesByFloorId: Object.fromEntries(
      floorsWithData.map(({ floorId, edgeList }) => [floorId, edgeList]),
    ),
    floors,
    initialFloorId: floors[0]?.id ?? null,
    nodesByFloorId: Object.fromEntries(
      floorsWithData.map(({ floorId, nodeList }) => [floorId, nodeList]),
    ),
    objectsByFloorId: Object.fromEntries(
      floorsWithData.map(({ floorId, objectList }) => [floorId, objectList]),
    ),
  };
}

export async function getInitialPublishedFloorId() {
  const payload = await getPayloadClient();

  const floorsResult = await payload.find({
    collection: "floors",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    sort: "level",
    where: {
      status: {
        equals: "published",
      },
    },
  });

  return floorsResult.docs[0] ? String(floorsResult.docs[0].id) : null;
}
