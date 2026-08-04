"use client";

import { useMemo } from "react";

import type {
  MapViewerData,
  ViewerMapNode,
  ViewerPathEdge,
} from "@/features/map-viewer/types/map-viewer.types";

import { findDefaultOriginNode } from "../lib/defaultOrigin";
import { findShortestPath } from "../lib/dijkstra";
import { buildRouteGraph } from "../lib/graph";
import { splitRouteByFloor } from "../lib/routeSegments";
import { useAppStore } from "@/store";

export function useRoute(data: MapViewerData) {
  const originNodeId = useAppStore((state) => state.originNodeId);
  const destinationNodeId = useAppStore((state) => state.destinationNodeId);
  const accessibleOnly = useAppStore((state) => state.accessibleOnly);
  const activeSegmentIndex = useAppStore((state) => state.activeSegmentIndex);

  const allNodes = useMemo(
    () => Object.values(data.nodesByFloorId).flat(),
    [data.nodesByFloorId],
  );
  const allEdges = useMemo(
    () => Object.values(data.edgesByFloorId).flat(),
    [data.edgesByFloorId],
  );

  const nodesById = useMemo(
    () => Object.fromEntries(allNodes.map((node) => [node.id, node])) as Record<string, ViewerMapNode>,
    [allNodes],
  );
  const edgesById = useMemo(
    () => Object.fromEntries(allEdges.map((edge) => [edge.id, edge])) as Record<string, ViewerPathEdge>,
    [allEdges],
  );

  const effectiveOriginId = originNodeId
    ?? findDefaultOriginNode(data.floors, data.nodesByFloorId)?.id
    ?? null;

  // Split from the route lookup below: the graph only depends on the
  // building's nodes/edges and the accessible-only filter — not on which
  // origin/destination is currently picked. Without this split, trying a
  // different destination (or origin) with the same accessibility setting
  // would rebuild the whole building's adjacency graph from scratch just to
  // change Dijkstra's start/end points.
  const graph = useMemo(
    () => buildRouteGraph(allNodes, allEdges, { accessibleOnly }),
    [allNodes, allEdges, accessibleOnly],
  );

  const route = useMemo(() => {
    if (!effectiveOriginId || !destinationNodeId) {
      return null;
    }

    return findShortestPath(graph, effectiveOriginId, destinationNodeId);
  }, [graph, effectiveOriginId, destinationNodeId]);

  const segments = useMemo(() => {
    if (!route) {
      return [];
    }

    return splitRouteByFloor(route, nodesById, edgesById);
  }, [route, nodesById, edgesById]);

  const clampedSegmentIndex = Math.min(
    activeSegmentIndex,
    Math.max(segments.length - 1, 0),
  );
  const activeSegment = segments[clampedSegmentIndex] ?? null;

  // Raw floor-local coordinates — matches the un-padded space MapViewerSvg's
  // node/edge/object layers already render in (padding is applied once, via
  // the shared <g transform> those layers sit inside).
  const routePoints = useMemo(() => {
    if (!activeSegment) {
      return [];
    }

    return activeSegment.nodeIds
      .map((nodeId) => nodesById[nodeId])
      .filter((node): node is ViewerMapNode => Boolean(node))
      .map((node) => ({ x: node.x, y: node.y }));
  }, [activeSegment, nodesById]);

  return {
    activeSegment,
    activeSegmentIndex: clampedSegmentIndex,
    allNodes,
    edgesById,
    effectiveOriginId,
    nodesById,
    route,
    routePoints,
    segments,
  };
}
