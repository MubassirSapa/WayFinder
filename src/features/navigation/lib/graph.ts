import type {
  ViewerMapNode,
  ViewerPathEdge,
} from "@/features/map-viewer/types/map-viewer.types";

import { FLOOR_CHANGE_PENALTY_METERS } from "../constants/routing.constants";
import type {
  RouteGraphAdjacency,
  RouteGraphAdjacencyEntry,
} from "../types/navigation.types";

export interface RouteGraphOptions {
  accessibleOnly?: boolean;
}

export function buildRouteGraph(
  nodes: ViewerMapNode[],
  edges: ViewerPathEdge[],
  options: RouteGraphOptions = {},
): RouteGraphAdjacency {
  const { accessibleOnly = false } = options;
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const graph: RouteGraphAdjacency = new Map();

  const isNodeUsable = (node: ViewerMapNode | undefined): node is ViewerMapNode => {
    if (!node) {
      return false;
    }

    return !accessibleOnly || node.isAccessible;
  };

  for (const node of nodes) {
    if (isNodeUsable(node)) {
      graph.set(node.id, []);
    }
  }

  const addEdge = (fromNodeId: string, entry: RouteGraphAdjacencyEntry) => {
    const existing = graph.get(fromNodeId);
    if (existing) {
      existing.push(entry);
    }
  };

  for (const edge of edges) {
    if (accessibleOnly && !edge.isAccessible) {
      continue;
    }

    const fromNode = nodesById.get(edge.fromNodeId);
    const toNode = nodesById.get(edge.toNodeId);

    if (!isNodeUsable(fromNode) || !isNodeUsable(toNode)) {
      continue;
    }

    // Crossing floors has real friction beyond the connector's own short
    // footprint distance — penalize it so the search only leaves a floor when
    // it's actually worth it, instead of bouncing through a floor and back
    // just because a connector's flat distance happens to be cheap.
    const weight = fromNode.floorId === toNode.floorId
      ? edge.distanceMeters
      : edge.distanceMeters + FLOOR_CHANGE_PENALTY_METERS;

    addEdge(edge.fromNodeId, {
      edgeId: edge.id,
      floorId: toNode.floorId,
      toNodeId: edge.toNodeId,
      type: edge.type,
      weight,
    });

    if (edge.bidirectional) {
      addEdge(edge.toNodeId, {
        edgeId: edge.id,
        floorId: fromNode.floorId,
        toNodeId: edge.fromNodeId,
        type: edge.type,
        weight,
      });
    }
  }

  return graph;
}
