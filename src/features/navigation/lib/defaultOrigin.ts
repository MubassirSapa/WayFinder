import type {
  ViewerFloor,
  ViewerMapNode,
} from "@/features/map-viewer/types/map-viewer.types";

export function findDefaultOriginNode(
  floors: ViewerFloor[],
  nodesByFloorId: Record<string, ViewerMapNode[]>,
): ViewerMapNode | null {
  const lowestFloor = floors[0];
  if (!lowestFloor) {
    return null;
  }

  const nodes = nodesByFloorId[lowestFloor.id] ?? [];
  const entrance = nodes.find((node) => node.role === "entrance");
  if (entrance) {
    return entrance;
  }

  const exit = nodes.find((node) => node.role === "exit");
  return exit ?? null;
}
