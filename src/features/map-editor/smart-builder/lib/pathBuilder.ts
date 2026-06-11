import { pixelsToMeters, pixelDistance, type Point } from "@/features/map-editor/core/lib/distance";
import type {
  EditorMapNode,
  EditorPathEdge,
} from "@/features/map-editor/core/types/map.types";

function createTempNodeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `temp_node_${crypto.randomUUID()}`;
  }

  return `temp_node_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function createTempEdgeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `temp_edge_${crypto.randomUUID()}`;
  }

  return `temp_edge_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

interface BuildHallwayPathInput {
  points: Point[];
  floorId: string;
  buildingId: string;
  metersPerPixel?: number | null;
}

interface BuildHallwayPathResult {
  nodes: EditorMapNode[];
  edges: EditorPathEdge[];
}

export function buildHallwayPath({
  points,
  floorId,
  buildingId,
  metersPerPixel,
}: BuildHallwayPathInput): BuildHallwayPathResult {
  if (points.length < 2) {
    return { nodes: [], edges: [] };
  }

  const scale = metersPerPixel ?? 0.05;
  const nodes = points.map((point, index) => {
    const id = createTempNodeId();

    return {
      id,
      floorId,
      buildingId,
      objectId: null,
      role: "hallway_point" as const,
      label: `Hallway ${index + 1}`,
      x: point.x,
      y: point.y,
      geometryType: "icon" as const,
      isAccessible: true,
      _clientId: id,
      _dirty: true,
    };
  });

  const edges = nodes.slice(0, -1).map((node, index) => {
    const nextNode = nodes[index + 1];
    const edgeId = createTempEdgeId();

    return {
      id: edgeId,
      floorId,
      buildingId,
      fromNodeId: node.id,
      toNodeId: nextNode.id,
      type: "walkway" as const,
      distanceMeters: pixelsToMeters(pixelDistance(node, nextNode), scale),
      bidirectional: true,
      isAccessible: true,
      _clientId: edgeId,
      _dirty: true,
    };
  });

  return { nodes, edges };
}
