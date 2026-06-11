import { pixelDistance, pixelsToMeters } from "@/features/map-editor/core/lib/distance";
import type {
  EditorMapNode,
  EditorPathEdge,
} from "@/features/map-editor/core/types/map.types";

const DEFAULT_MAX_CONNECTION_DISTANCE = 120;

function createTempEdgeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `temp_edge_${crypto.randomUUID()}`;
  }

  return `temp_edge_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export function isHallwayPointNode(node: EditorMapNode): boolean {
  return node.role === "hallway_point";
}

export function findNearestHallwayNode(
  sourceNode: EditorMapNode,
  nodes: EditorMapNode[],
  maxDistancePx: number = DEFAULT_MAX_CONNECTION_DISTANCE,
): EditorMapNode | null {
  let nearestNode: EditorMapNode | null = null;
  let nearestDistance = maxDistancePx;

  for (const candidate of nodes) {
    if (
      candidate.id === sourceNode.id ||
      candidate.floorId !== sourceNode.floorId ||
      !isHallwayPointNode(candidate)
    ) {
      continue;
    }

    const distance = pixelDistance(sourceNode, candidate);
    if (distance <= nearestDistance) {
      nearestNode = candidate;
      nearestDistance = distance;
    }
  }

  return nearestNode;
}

export function edgeExistsBetweenNodes(
  edges: EditorPathEdge[],
  fromNodeId: string,
  toNodeId: string,
): boolean {
  return edges.some((edge) => {
    if (edge.fromNodeId === fromNodeId && edge.toNodeId === toNodeId) {
      return true;
    }

    return (
      edge.fromNodeId === toNodeId &&
      edge.toNodeId === fromNodeId &&
      edge.bidirectional
    );
  });
}

export function buildConnectionEdge(
  fromNode: EditorMapNode,
  toNode: EditorMapNode,
  edges: EditorPathEdge[],
  metersPerPixel: number = 0.05,
): EditorPathEdge | null {
  if (
    fromNode.floorId !== toNode.floorId ||
    edgeExistsBetweenNodes(edges, fromNode.id, toNode.id)
  ) {
    return null;
  }

  const id = createTempEdgeId();

  return {
    id,
    floorId: fromNode.floorId,
    buildingId: fromNode.buildingId,
    fromNodeId: fromNode.id,
    toNodeId: toNode.id,
    type: "walkway",
    distanceMeters: pixelsToMeters(pixelDistance(fromNode, toNode), metersPerPixel),
    bidirectional: true,
    isAccessible: fromNode.isAccessible && toNode.isAccessible,
    _clientId: id,
    _dirty: true,
  };
}

export function buildNearestHallwayConnection(
  sourceNode: EditorMapNode,
  nodes: EditorMapNode[],
  edges: EditorPathEdge[],
  metersPerPixel: number = 0.05,
  maxDistancePx: number = DEFAULT_MAX_CONNECTION_DISTANCE,
): EditorPathEdge | null {
  if (isHallwayPointNode(sourceNode)) {
    return null;
  }

  const nearestHallwayNode = findNearestHallwayNode(
    sourceNode,
    nodes,
    maxDistancePx,
  );

  if (!nearestHallwayNode) {
    return null;
  }

  return buildConnectionEdge(sourceNode, nearestHallwayNode, edges, metersPerPixel);
}
