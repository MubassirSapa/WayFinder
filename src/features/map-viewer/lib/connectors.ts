import type { ViewerMapNode, ViewerPathEdge } from "../types/map-viewer.types";

const CONNECTOR_NODE_ROLES = new Set<ViewerMapNode["role"]>([
  "stairs_entry",
  "elevator_entry",
  "escalator_entry",
]);

export function isConnectorNode(node: ViewerMapNode) {
  return CONNECTOR_NODE_ROLES.has(node.role);
}

export type ConnectorType = "stairs" | "elevator" | "escalator";

const CONNECTOR_TYPE_BY_ROLE: Partial<Record<ViewerMapNode["role"], ConnectorType>> = {
  elevator_entry: "elevator",
  escalator_entry: "escalator",
  stairs_entry: "stairs",
};

export function getConnectorType(role: ViewerMapNode["role"]): ConnectorType | null {
  return CONNECTOR_TYPE_BY_ROLE[role] ?? null;
}

export interface ConnectorTarget {
  floorId: string;
  node: ViewerMapNode;
}

// A cross-floor edge is only stored under its origin floor's bucket (see
// getMapViewerData), so the search must scan every floor's edges, not just
// the connector's own floor, to find its matches on either side. A connector
// can service more than two floors (e.g. an elevator), so this returns every
// distinct floor it connects to, not just the first one found — one entry
// per floor, deduped, so callers with a single target can jump directly and
// callers with several can offer a choice instead of guessing.
export function findConnectorTargets(
  node: ViewerMapNode,
  allEdges: ViewerPathEdge[],
  nodesById: Record<string, ViewerMapNode>,
): ConnectorTarget[] {
  if (!isConnectorNode(node)) {
    return [];
  }

  const targetsByFloorId = new Map<string, ConnectorTarget>();

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
    if (otherNode && otherNode.floorId !== node.floorId && !targetsByFloorId.has(otherNode.floorId)) {
      targetsByFloorId.set(otherNode.floorId, { floorId: otherNode.floorId, node: otherNode });
    }
  }

  return Array.from(targetsByFloorId.values());
}
