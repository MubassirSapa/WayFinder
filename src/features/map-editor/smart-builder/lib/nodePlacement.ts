import { getDefaultDimensions } from "@/features/map-editor/core/lib/objectDefaults";
import type {
  EditorMapNode,
  EditorMapObject,
} from "@/features/map-editor/core/types/map.types";

const SMART_NODE_ROLE_BY_OBJECT_TYPE: Partial<
  Record<EditorMapObject["type"], EditorMapNode["role"]>
> = {
  room: "entrance",
  exit: "exit",
  stairs: "stairs_entry",
  elevator: "elevator_entry",
  shelf: "shelf_access",
  section: "shelf_access",
};

function createTempNodeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `temp_node_${crypto.randomUUID()}`;
  }

  return `temp_node_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export function getSmartNodeRoleForObject(
  objectType: EditorMapObject["type"],
): EditorMapNode["role"] | null {
  return SMART_NODE_ROLE_BY_OBJECT_TYPE[objectType] ?? null;
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

export function buildSmartNodeForObject(
  object: EditorMapObject,
  nodes: EditorMapNode[],
): EditorMapNode | null {
  const role = getSmartNodeRoleForObject(object.type);

  if (!role || hasLinkedNodeForObject(object.id, nodes)) {
    return null;
  }

  const defaults = getDefaultDimensions(object.type);
  const width = object.width || defaults.width;
  const height = object.height || defaults.height;
  const id = createTempNodeId();
  const labelSource = object.label || object.name || role.replaceAll("_", " ");

  return {
    id,
    floorId: object.floorId,
    buildingId: object.buildingId,
    objectId: object.id,
    role,
    label: labelSource,
    x: object.x + width / 2,
    y: object.y + height,
    geometryType: "icon",
    isAccessible: object.isAccessible,
    _clientId: id,
    _dirty: true,
  };
}
