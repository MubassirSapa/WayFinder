import type { ViewerMapNode } from "@/features/map-viewer/types/map-viewer.types";

import { findShortestPath } from "./dijkstra";
import type { RouteGraphAdjacency } from "../types/navigation.types";

// Existence-only lookups (e.g. "is this object routable at all") don't care
// which of an object's nodes matches, so the first one is fine - callers that
// actually route TO/FROM the resolved node should use findBestNodeIdForObject
// instead, since an object can have more than one node (multiple entrances).
export function findNodeIdForObject(
  objectId: string,
  nodes: ViewerMapNode[],
): string | null {
  const node = nodes.find((candidate) => candidate.objectId === objectId);
  return node?.id ?? null;
}

export function findNodeIdsForObject(
  objectId: string,
  nodes: ViewerMapNode[],
): string[] {
  return nodes
    .filter((candidate) => candidate.objectId === objectId)
    .map((node) => node.id);
}

// An object with multiple entrances (nodes sharing the same objectId) used to
// always resolve to whichever one happened to be first in the array,
// regardless of which was actually closer or which side of an
// accessible-only route was reachable. When there's a known other endpoint to
// route against, this tries every candidate and keeps whichever produces the
// shortest valid path - falling back to the first candidate only when there's
// no other endpoint yet to compare against (nothing to optimize for).
export function findBestNodeIdForObject(
  objectId: string,
  nodes: ViewerMapNode[],
  graph: RouteGraphAdjacency,
  otherEndpointNodeId: string | null,
  role: "origin" | "destination",
): string | null {
  const candidateIds = findNodeIdsForObject(objectId, nodes);
  if (candidateIds.length === 0) {
    return null;
  }

  if (candidateIds.length === 1 || !otherEndpointNodeId) {
    return candidateIds[0];
  }

  let best: { nodeId: string; distance: number } | null = null;
  for (const candidateId of candidateIds) {
    const result = role === "origin"
      ? findShortestPath(graph, candidateId, otherEndpointNodeId)
      : findShortestPath(graph, otherEndpointNodeId, candidateId);

    if (result && (!best || result.totalDistanceMeters < best.distance)) {
      best = { distance: result.totalDistanceMeters, nodeId: candidateId };
    }
  }

  return best?.nodeId ?? null;
}
