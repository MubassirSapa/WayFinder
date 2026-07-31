import type {
  ViewerMapNode,
  ViewerPathEdge,
} from "@/features/map-viewer/types/map-viewer.types";

import type {
  RouteFloorSegment,
  ShortestPathResult,
} from "../types/navigation.types";

export function splitRouteByFloor(
  path: ShortestPathResult,
  nodesById: Record<string, ViewerMapNode>,
  edgesById: Record<string, ViewerPathEdge>,
): RouteFloorSegment[] {
  const segments: RouteFloorSegment[] = [];

  for (let index = 0; index < path.nodeIds.length; index += 1) {
    const nodeId = path.nodeIds[index];
    const node = nodesById[nodeId];
    if (!node) {
      continue;
    }

    const connectingEdgeId = index > 0 ? path.edgeIds[index - 1] : undefined;
    const current = segments.at(-1);

    if (current && current.floorId === node.floorId) {
      current.nodeIds.push(nodeId);
      if (connectingEdgeId) {
        current.edgeIds.push(connectingEdgeId);
      }
      continue;
    }

    if (current && connectingEdgeId) {
      current.edgeIds.push(connectingEdgeId);
    }

    segments.push({
      edgeIds: [],
      enterViaEdgeType: connectingEdgeId
        ? edgesById[connectingEdgeId]?.type
        : undefined,
      floorId: node.floorId,
      nodeIds: [nodeId],
    });
  }

  return segments;
}
