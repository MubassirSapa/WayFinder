import type {
  RouteGraphAdjacency,
  ShortestPathResult,
} from "../types/navigation.types";

export function findShortestPath(
  graph: RouteGraphAdjacency,
  originNodeId: string,
  destinationNodeId: string,
): ShortestPathResult | null {
  if (!graph.has(originNodeId) || !graph.has(destinationNodeId)) {
    return null;
  }

  if (originNodeId === destinationNodeId) {
    return { edgeIds: [], nodeIds: [originNodeId], totalDistanceMeters: 0 };
  }

  const distances = new Map<string, number>();
  const previous = new Map<string, { edgeId: string; nodeId: string }>();
  const visited = new Set<string>();

  for (const nodeId of graph.keys()) {
    distances.set(nodeId, Infinity);
  }
  distances.set(originNodeId, 0);

  while (visited.size < graph.size) {
    let currentNodeId: string | null = null;
    let currentDistance = Infinity;

    for (const [nodeId, distance] of distances) {
      if (!visited.has(nodeId) && distance < currentDistance) {
        currentNodeId = nodeId;
        currentDistance = distance;
      }
    }

    if (currentNodeId === null || currentDistance === Infinity) {
      break;
    }

    if (currentNodeId === destinationNodeId) {
      break;
    }

    visited.add(currentNodeId);

    const neighbors = graph.get(currentNodeId) ?? [];
    for (const neighbor of neighbors) {
      if (visited.has(neighbor.toNodeId)) {
        continue;
      }

      const candidateDistance = currentDistance + neighbor.weight;
      if (candidateDistance < (distances.get(neighbor.toNodeId) ?? Infinity)) {
        distances.set(neighbor.toNodeId, candidateDistance);
        previous.set(neighbor.toNodeId, {
          edgeId: neighbor.edgeId,
          nodeId: currentNodeId,
        });
      }
    }
  }

  const totalDistanceMeters = distances.get(destinationNodeId) ?? Infinity;
  if (totalDistanceMeters === Infinity) {
    return null;
  }

  const nodeIds: string[] = [destinationNodeId];
  const edgeIds: string[] = [];
  let cursor = destinationNodeId;

  while (cursor !== originNodeId) {
    const step = previous.get(cursor);
    if (!step) {
      return null;
    }

    edgeIds.unshift(step.edgeId);
    nodeIds.unshift(step.nodeId);
    cursor = step.nodeId;
  }

  return { edgeIds, nodeIds, totalDistanceMeters };
}
