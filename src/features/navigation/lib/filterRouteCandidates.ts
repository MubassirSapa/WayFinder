import type { ViewerMapNode, ViewerMapObject } from "@/features/map-viewer/types/map-viewer.types";

import { findNodeIdForObject } from "./findNodeForObject";

const MAX_CANDIDATES = 5;

// Only objects that actually resolve to a routable node are worth showing —
// anything else was a dead click (looked like a valid result, picking it did
// nothing, no feedback). Filtering here means every visible suggestion is
// guaranteed to work. An empty query still returns the first few candidates
// instead of nothing, so focusing an empty From/To field doesn't look broken.
export function filterRouteCandidates(
  objects: ViewerMapObject[],
  nodes: ViewerMapNode[],
  query: string,
) {
  const normalized = query.trim().toLowerCase();

  return objects
    .filter(
      (object) =>
        !normalized ||
        object.name.toLowerCase().includes(normalized) ||
        object.label.toLowerCase().includes(normalized),
    )
    .filter((object) => findNodeIdForObject(object.id, nodes) !== null)
    .slice(0, MAX_CANDIDATES);
}
