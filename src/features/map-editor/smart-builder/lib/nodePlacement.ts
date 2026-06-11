import { getDefaultDimensions } from "@/features/map-editor/core/lib/objectDefaults";
import type {
  EditorMapNode,
  EditorMapObject,
} from "@/features/map-editor/core/types/map.types";
import { getSmartObjectNodeRule } from "./objectNodeRules";

function createTempNodeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `temp_node_${crypto.randomUUID()}`;
  }

  return `temp_node_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export function getSmartNodeRoleForObject(
  objectType: EditorMapObject["type"],
): EditorMapNode["role"] | null {
  return getSmartObjectNodeRule(objectType)?.nodeRole ?? null;
}

export function shouldAutoCreateNodeForObject(
  objectType: EditorMapObject["type"],
): boolean {
  return getSmartNodeRoleForObject(objectType) !== null;
}

export function hasLinkedNodeForObject(
  objectId: string,
  nodes: EditorMapNode[],
): boolean {
  return nodes.some((node) => node.objectId === objectId);
}

function getObjectCenter(object: EditorMapObject): { x: number; y: number } {
  return {
    x: object.x + object.width / 2,
    y: object.y + object.height / 2,
  };
}

function findNearestHallwayObjectForObject(
  object: EditorMapObject,
  objects: EditorMapObject[],
): EditorMapObject | null {
  let nearestHallway: EditorMapObject | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;
  const center = getObjectCenter(object);

  for (const candidate of objects) {
    if (
      candidate.id === object.id ||
      candidate.floorId !== object.floorId ||
      candidate.type !== "hallway"
    ) {
      continue;
    }

    const candidateCenter = getObjectCenter(candidate);
    const distance = Math.sqrt(
      Math.pow(candidateCenter.x - center.x, 2) +
        Math.pow(candidateCenter.y - center.y, 2),
    );

    if (distance < nearestDistance) {
      nearestHallway = candidate;
      nearestDistance = distance;
    }
  }

  return nearestHallway;
}

function getNodePositionFacingHallway(
  object: EditorMapObject,
  hallway: EditorMapObject | null,
): { x: number; y: number } {
  const center = getObjectCenter(object);

  if (!hallway) {
    return {
      x: center.x,
      y: object.y + object.height,
    };
  }

  const hallwayCenter = getObjectCenter(hallway);
  const deltaX = hallwayCenter.x - center.x;
  const deltaY = hallwayCenter.y - center.y;

  if (Math.abs(deltaX) >= Math.abs(deltaY)) {
    return {
      x: deltaX >= 0 ? object.x + object.width : object.x,
      y: center.y,
    };
  }

  return {
    x: center.x,
    y: deltaY >= 0 ? object.y + object.height : object.y,
  };
}

export function buildSmartNodeForObject(
  object: EditorMapObject,
  nodes: EditorMapNode[],
  objects: EditorMapObject[] = [],
): EditorMapNode | null {
  const role = getSmartNodeRoleForObject(object.type);

  if (!role || hasLinkedNodeForObject(object.id, nodes)) {
    return null;
  }

  const defaults = getDefaultDimensions(object.type);
  const width = object.width || defaults.width;
  const height = object.height || defaults.height;
  const objectWithDimensions = { ...object, width, height };
  const nearestHallway = findNearestHallwayObjectForObject(
    objectWithDimensions,
    objects,
  );
  const position = getNodePositionFacingHallway(
    objectWithDimensions,
    nearestHallway,
  );
  const id = createTempNodeId();
  const labelSource = object.label || object.name || role.replaceAll("_", " ");

  return {
    id,
    floorId: object.floorId,
    buildingId: object.buildingId,
    objectId: object.id,
    role,
    label: labelSource,
    x: position.x,
    y: position.y,
    geometryType: "icon",
    isAccessible: object.isAccessible,
    _clientId: id,
    _dirty: true,
  };
}
