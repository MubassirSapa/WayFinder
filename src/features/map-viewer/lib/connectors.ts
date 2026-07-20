import type { ViewerMapNode, ViewerPathEdge } from "../types/map-viewer.types";

const CONNECTOR_NODE_ROLES = new Set<ViewerMapNode["role"]>([
  "stairs_entry",
  "elevator_entry",
  "escalator_entry",
]);

export function isConnectorNode(node: ViewerMapNode) {
  return CONNECTOR_NODE_ROLES.has(node.role);
}

export interface ConnectorTarget {
  floorId: string;
  node: ViewerMapNode;
}

// A cross-floor edge is only stored under its origin floor's bucket (see
// getMapViewerData), so the search must scan every floor's edges, not just
// the connector's own floor, to find its match on either side.
export function findConnectorTarget(
  node: ViewerMapNode,
  allEdges: ViewerPathEdge[],
  nodesById: Record<string, ViewerMapNode>,
): ConnectorTarget | null {
  if (!isConnectorNode(node)) {
    return null;
  }

  for (const edge of allEdges) {
    const otherNodeId = edge.fromNodeId === node.id
      ? edge.toNodeId
      : edge.toNodeId === node.id
        ? edge.fromNodeId
        : null;

    if (!otherNodeId) {
      continue;
    }

    const otherNode = nodesById[otherNodeId];
    if (otherNode && otherNode.floorId !== node.floorId) {
      return { floorId: otherNode.floorId, node: otherNode };
    }
  }

  return null;
}
