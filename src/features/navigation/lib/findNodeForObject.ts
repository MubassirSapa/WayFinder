import type { ViewerMapNode } from "@/features/map-viewer/types/map-viewer.types";

export function findNodeIdForObject(
  objectId: string,
  nodes: ViewerMapNode[],
): string | null {
  const node = nodes.find((candidate) => candidate.objectId === objectId);
  return node?.id ?? null;
}
