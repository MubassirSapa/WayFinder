import { edgeExistsBetweenNodes } from "@/features/map-editor/smart-builder/lib/autoConnect";
import type { EditorPathEdge } from "@/features/map-editor/core/types/map.types";

export type CrossFloorEdgeType = "stairs" | "elevator" | "escalator";

// Only the fields buildCrossFloorEdge needs — EditorMapNode and the
// server-fetched LinkableFloorLinkNode (which lacks geometryType/objectId)
// both satisfy this structurally, so either can be passed directly.
export interface CrossFloorNodeRef {
  id: string;
  floorId: string;
  buildingId: string;
  isAccessible: boolean;
}

export const CROSS_FLOOR_DEFAULT_DISTANCE_METERS: Record<CrossFloorEdgeType, number> = {
  elevator: 3,
  escalator: 4,
  stairs: 6,
};

export const CONNECTOR_NODE_ROLES = ["stairs_entry", "elevator_entry", "escalator_entry"] as const;
export type ConnectorNodeRole = (typeof CONNECTOR_NODE_ROLES)[number];

export function isConnectorNodeRole(role: string): role is ConnectorNodeRole {
  return (CONNECTOR_NODE_ROLES as readonly string[]).includes(role);
}

// A node's role already determines which connector type a link from it can
// be (a stairs_entry node can only be linked via "stairs"), so this derives
// the type instead of asking the admin to pick it redundantly.
export const CROSS_FLOOR_TYPE_BY_NODE_ROLE: Record<ConnectorNodeRole, CrossFloorEdgeType> = {
  elevator_entry: "elevator",
  escalator_entry: "escalator",
  stairs_entry: "stairs",
};

function createTempCrossFloorEdgeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `temp_edge_${crypto.randomUUID()}`;
  }

  return `temp_edge_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export function buildCrossFloorEdge(
  fromNode: CrossFloorNodeRef,
  toNode: CrossFloorNodeRef,
  edges: EditorPathEdge[],
  type: CrossFloorEdgeType,
  distanceMeters: number = CROSS_FLOOR_DEFAULT_DISTANCE_METERS[type],
): EditorPathEdge | null {
  if (
    fromNode.floorId === toNode.floorId
    || edgeExistsBetweenNodes(edges, fromNode.id, toNode.id)
  ) {
    return null;
  }

  const id = createTempCrossFloorEdgeId();

  return {
    _clientId: id,
    _dirty: true,
    bidirectional: true,
    buildingId: fromNode.buildingId,
    distanceMeters,
    floorId: fromNode.floorId,
    fromNodeId: fromNode.id,
    id,
    isAccessible: fromNode.isAccessible && toNode.isAccessible,
    toNodeId: toNode.id,
    type,
  };
}
