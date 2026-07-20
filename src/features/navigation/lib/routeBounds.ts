import { MAP_VIEWER_FLOOR_CONTENT_PADDING } from "@/features/map-viewer/constants/mapViewer.constants";
import type { WorldBounds } from "@/features/map-viewer/lib/mapViewerViewport";
import type { ViewerMapNode } from "@/features/map-viewer/types/map-viewer.types";

import type { RouteFloorSegment } from "../types/navigation.types";

export function getRouteSegmentBounds(
  segment: RouteFloorSegment,
  nodesById: Record<string, ViewerMapNode>,
): WorldBounds | null {
  const points = segment.nodeIds
    .map((nodeId) => nodesById[nodeId])
    .filter((node): node is ViewerMapNode => Boolean(node));

  if (points.length === 0) {
    return null;
  }

  const xs = points.map((node) => node.x + MAP_VIEWER_FLOOR_CONTENT_PADDING);
  const ys = points.map((node) => node.y + MAP_VIEWER_FLOOR_CONTENT_PADDING);

  return {
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
    minX: Math.min(...xs),
    minY: Math.min(...ys),
  };
}
