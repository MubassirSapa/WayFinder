"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { toast } from "sonner";

import type { ViewerMapNode, ViewerPathEdge } from "@/features/map-viewer/types/map-viewer.types";
import { useAppStore } from "@/store";

import { NAVIGATION_CLIENT } from "../constants/navigation.constants";
import { findShortestPath } from "../lib/dijkstra";
import { findBestNodeIdForObject, findNodeIdsForObject } from "../lib/findNodeForObject";
import { buildRouteGraph } from "../lib/graph";
import type { RouteGraphAdjacency } from "../types/navigation.types";

interface UseApplyRouteFromUrlArgs {
  accessibleOnly: boolean;
  destObjectId: string | null;
  edges: ViewerPathEdge[];
  initialFloorId: string | null;
  nodes: ViewerMapNode[];
  onOriginObjectResolved?: (objectId: string) => void;
  startObjectId: string | null;
}

// Both endpoints can be objects with more than one entrance at once here (a
// shared link with both ?startObject= and ?destObject=), so neither side can
// be resolved against a fixed "other endpoint" the way a single manual pick
// can - the best origin entrance depends on which destination entrance is
// chosen and vice versa. Tries every combination and keeps the shortest
// valid pair; falls back to the object's first node on either side once
// nothing about it is ambiguous (a single candidate, or the other side
// couldn't be resolved at all), so this only does extra work when there's
// genuinely more than one entrance to weigh.
function resolveBestNodePair(
  startObjectId: string,
  destObjectId: string,
  nodes: ViewerMapNode[],
  graph: RouteGraphAdjacency,
): { destinationNodeId: string | null; originNodeId: string | null } {
  const startCandidates = findNodeIdsForObject(startObjectId, nodes);
  const destCandidates = findNodeIdsForObject(destObjectId, nodes);

  if (startCandidates.length === 0 || destCandidates.length === 0) {
    return { destinationNodeId: destCandidates[0] ?? null, originNodeId: startCandidates[0] ?? null };
  }

  if (startCandidates.length === 1 && destCandidates.length === 1) {
    return { destinationNodeId: destCandidates[0], originNodeId: startCandidates[0] };
  }

  let best: { destinationNodeId: string; distance: number; originNodeId: string } | null = null;
  for (const originCandidate of startCandidates) {
    for (const destinationCandidate of destCandidates) {
      const result = findShortestPath(graph, originCandidate, destinationCandidate);
      if (result && (!best || result.totalDistanceMeters < best.distance)) {
        best = {
          destinationNodeId: destinationCandidate,
          distance: result.totalDistanceMeters,
          originNodeId: originCandidate,
        };
      }
    }
  }

  return {
    destinationNodeId: best?.destinationNodeId ?? null,
    originNodeId: best?.originNodeId ?? null,
  };
}

// Applies the origin/destination/accessibility state a page load arrived
// with via ?startObject=/&destObject=/&accessible= (a QR scan or a shared
// route link - see docs/technical/ROUTE_URL_STATE.md). These are one-shot
// instructions, not persistent state: once applied, the query string is
// stripped via router.replace so a later manual refresh - or picking a
// different from/to afterward, then refreshing - doesn't keep re-forcing
// the state back to whatever the original link said.
export function useApplyRouteFromUrl({
  accessibleOnly,
  destObjectId,
  edges,
  initialFloorId,
  nodes,
  onOriginObjectResolved,
  startObjectId,
}: UseApplyRouteFromUrlArgs) {
  const setOrigin = useAppStore((state) => state.setOrigin);
  const setDestination = useAppStore((state) => state.setDestination);
  const setAccessibleOnly = useAppStore((state) => state.setAccessibleOnly);
  const router = useRouter();
  const pathname = usePathname();

  // Built locally from the URL's own accessibleOnly, not read from the
  // store/useRoute's graph - that one reflects whatever accessibility
  // setting was already active *before* this link's ?accessible= is applied
  // below, which would pick candidate nodes against the wrong graph on a
  // fresh session (store defaults to false until setAccessibleOnly(true)
  // runs, and that update isn't visible until next render).
  const graph = useMemo(
    () => buildRouteGraph(nodes, edges, { accessibleOnly }),
    [nodes, edges, accessibleOnly],
  );

  useEffect(() => {
    if (!startObjectId && !destObjectId) {
      return;
    }

    if (startObjectId && destObjectId) {
      // Both endpoints may be multi-entrance objects at once - resolve them
      // jointly so the pick on one side accounts for the other, instead of
      // picking a side's node in isolation.
      const { destinationNodeId, originNodeId } = resolveBestNodePair(startObjectId, destObjectId, nodes, graph);

      if (originNodeId) {
        setOrigin(originNodeId);
      } else {
        toast.error(NAVIGATION_CLIENT.ERROR_START_NOT_ROUTABLE);
      }

      if (destinationNodeId) {
        setDestination(destinationNodeId);
      } else {
        toast.error(NAVIGATION_CLIENT.ERROR_DEST_NOT_ROUTABLE);
      }
    } else if (startObjectId) {
      const nodeId = findBestNodeIdForObject(startObjectId, nodes, graph, null, "origin");
      if (nodeId) {
        setOrigin(nodeId);
        // A start+dest link is already legible via the drawn route line -
        // only a start-only link needs the object visibly "selected" so it
        // reads as "you are here" rather than just silently routable.
        onOriginObjectResolved?.(startObjectId);
      } else {
        toast.error(NAVIGATION_CLIENT.ERROR_START_NOT_ROUTABLE);
      }
    } else if (destObjectId) {
      const nodeId = findBestNodeIdForObject(destObjectId, nodes, graph, null, "destination");
      if (nodeId) {
        setDestination(nodeId);
      } else {
        toast.error(NAVIGATION_CLIENT.ERROR_DEST_NOT_ROUTABLE);
      }
    }

    // Only ever turns this on - never forces it back off, so this doesn't
    // fight the reset effect that already runs first on a fresh floor load.
    if (accessibleOnly) {
      setAccessibleOnly(true);
    }

    router.replace(pathname, { scroll: false });
  }, [initialFloorId, startObjectId, destObjectId, accessibleOnly, nodes, graph, setOrigin, setDestination, setAccessibleOnly, onOriginObjectResolved, router, pathname]);
}
