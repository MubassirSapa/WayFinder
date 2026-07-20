import type {
  Floor,
  Media,
  MapNode,
  MapObject,
  PathEdge,
} from "@/payload-types";
import { getPayloadClient } from "@/lib/getPayloadClient";
import { resolveOrganizationNamesByBuildingId } from "@/lib/organizationBuilding";

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

function hasMediaDocument(value: unknown): value is Media {
  return typeof value === "object" && value !== null && "alt" in value && "id" in value;
}

function normalizeFloor(doc: Floor, organizationName: string | null): ViewerFloor {
  const floorDoc = doc as Floor & {
    backgroundImage?: Media | number | null;
    metersPerPixel?: number | null;
  };

  return {
    id: String(doc.id),
    buildingId: doc.buildingId,
    organizationName,
    name: doc.name,
    level: doc.level ?? 0,
    width: doc.width ?? 1200,
    height: doc.height ?? 800,
    metersPerPixel: floorDoc.metersPerPixel ?? null,
    backgroundImageUrl: hasMediaDocument(floorDoc.backgroundImage)
      ? floorDoc.backgroundImage.url ?? doc.backgroundImageUrl ?? null
      : doc.backgroundImageUrl ?? null,
    status: doc.status ?? "draft",
  };
}

function normalizeObject(doc: MapObject): ViewerMapObject {
  return {
    id: String(doc.id),
    floorId: getRequiredRelationId(doc.floor),
    buildingId: doc.buildingId,
    parentObjectId: getRelationId(doc.parentObject),
    type: doc.type,
    name: doc.name,
    label: doc.label ?? "",
    x: doc.x ?? 0,
    y: doc.y ?? 0,
    width: doc.width ?? 100,
    height: doc.height ?? 80,
    rotation: doc.rotation ?? 0,
    isSearchable: doc.isSearchable ?? true,
    isAccessible: doc.isAccessible ?? true,
  };
}

function normalizeNode(doc: MapNode): ViewerMapNode {
  return {
    id: String(doc.id),
    floorId: getRequiredRelationId(doc.floor),
    buildingId: doc.buildingId,
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
    buildingId: doc.buildingId,
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
        overrideAccess: true,
      })
      .catch(() => null);
    buildingId = requestedFloor?.buildingId ?? undefined;
  }

  const floorsResult = await payload.find({
    collection: "floors",
    depth: 1,
    limit: 100,
    overrideAccess: true,
    sort: "level",
    where: {
      and: [
        { status: { equals: "published" } },
        ...(buildingId ? [{ buildingId: { equals: buildingId } }] : []),
      ],
    },
  });

  const organizationNamesByBuildingId = await resolveOrganizationNamesByBuildingId(
    floorsResult.docs.map((doc) => doc.buildingId),
  );
  const floors = floorsResult.docs.map((doc) =>
    normalizeFloor(doc, organizationNamesByBuildingId[doc.buildingId] ?? null),
  );

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
              equals: Number(floor.id),
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
              equals: Number(floor.id),
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
              equals: Number(floor.id),
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
