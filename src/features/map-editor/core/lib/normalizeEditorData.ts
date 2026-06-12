import type {
  Floor,
  MapNode as PayloadMapNode,
  MapObject as PayloadMapObject,
  PathEdge as PayloadPathEdge,
} from '@/payload-types';
import type { EditorFloor, EditorMapNode, EditorMapObject, EditorPathEdge } from '../types/map.types';

type RelationValue = number | string | { id: number | string } | null | undefined;

function hasNumericOrStringId(value: unknown): value is { id: number | string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    (typeof value.id === 'number' || typeof value.id === 'string')
  );
}

function getRelationId(relation: RelationValue): string | null {
  if (relation === null || relation === undefined) return null;
  if (hasNumericOrStringId(relation)) return String(relation.id);
  return String(relation);
}

function getRequiredRelationId(relation: Exclude<RelationValue, null | undefined>): string {
  if (hasNumericOrStringId(relation)) return String(relation.id);
  return String(relation);
}

export function normalizeFloor(doc: Floor): EditorFloor {
  const floorDoc = doc as Floor & { metersPerPixel?: number | null };

  return {
    id: String(doc.id),
    buildingId: doc.buildingId,
    name: doc.name,
    level: doc.level ?? 0,
    width: doc.width ?? 1200,
    height: doc.height ?? 800,
    metersPerPixel: floorDoc.metersPerPixel ?? null,
    backgroundImageUrl: doc.backgroundImageUrl,
    status: doc.status ?? 'draft',
  };
}

export function normalizeMapObject(doc: PayloadMapObject): EditorMapObject {
  return {
    id: String(doc.id),
    floorId: getRequiredRelationId(doc.floor),
    buildingId: doc.buildingId,
    parentObjectId: getRelationId(doc.parentObject),
    type: doc.type,
    name: doc.name,
    label: doc.label ?? '',
    x: doc.x ?? 0,
    y: doc.y ?? 0,
    width: doc.width ?? 100,
    height: doc.height ?? 80,
    rotation: doc.rotation ?? 0,
    isSearchable: doc.isSearchable ?? true,
    isAccessible: doc.isAccessible ?? true,
  };
}

export function normalizeMapNode(doc: PayloadMapNode): EditorMapNode {
  return {
    id: String(doc.id),
    floorId: getRequiredRelationId(doc.floor),
    buildingId: doc.buildingId,
    objectId: getRelationId(doc.object),
    role: doc.role,
    label: doc.label ?? '',
    x: doc.x ?? 0,
    y: doc.y ?? 0,
    width: doc.width ?? undefined,
    height: doc.height ?? undefined,
    rotation: doc.rotation ?? undefined,
    geometryType: doc.geometryType ?? 'icon',
    points: doc.points?.map((point) => ({
      x: point.x,
      y: point.y,
      id: point.id ? String(point.id) : null,
    })) ?? null,
    isAccessible: doc.isAccessible ?? true,
  };
}

export function normalizePathEdge(doc: PayloadPathEdge): EditorPathEdge {
  return {
    id: String(doc.id),
    floorId: getRequiredRelationId(doc.floor),
    buildingId: doc.buildingId,
    fromNodeId: getRequiredRelationId(doc.fromNode),
    toNodeId: getRequiredRelationId(doc.toNode),
    type: doc.type ?? 'walkway',
    distanceMeters: doc.distanceMeters ?? 0,
    bidirectional: doc.bidirectional ?? true,
    isAccessible: doc.isAccessible ?? true,
  };
}
