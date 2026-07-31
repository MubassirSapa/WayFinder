'use client';

import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { FloorHopIndicator } from "@/features/navigation/components/FloorHopIndicator";
import { MapSelectionBar } from "@/features/navigation/components/MapSelectionBar";
import { RouteOriginTrigger } from "@/features/navigation/components/RouteOriginTrigger";
import { RoutePanel } from "@/features/navigation/components/RoutePanel";
import { useRoute } from "@/features/navigation/hooks/useRoute";
import { getRouteSegmentBounds } from "@/features/navigation/lib/routeBounds";
import { findNodeIdForObject } from "@/features/navigation/lib/findNodeForObject";
import { useAppStore } from "@/store";

import { MAP_VIEWER_FLOOR_CONTENT_PADDING } from "../constants/mapViewer.constants";
import { MAP_VIEWER_THEME_CLASSNAMES } from "../constants/mapViewerTheme.constants";
import { findConnectorTarget, isConnectorNode } from "../lib/connectors";
import { useMapViewerViewport } from "../hooks/useMapViewerViewport";
import type {
  ConnectorTargetInfo,
  MapViewerData,
  ViewerMapObject,
} from "../types/map-viewer.types";
import { MapViewerCanvas } from "./MapViewerCanvas";
import { MapViewerPageHeader } from "./MapViewerPageHeader";
import { MapViewerSidebar } from "./MapViewerSidebar";
import { MapViewerToolbar } from "./MapViewerToolbar";

const CONNECTOR_JUMP_FOCUS_RADIUS = 260;

interface MapViewerShellProps {
  data: MapViewerData;
}

export function MapViewerShell({ data }: MapViewerShellProps) {
  const storedActiveFloorId = useAppStore((state) => state.activeFloorId);
  const setActiveFloorId = useAppStore((state) => state.setActiveFloorId);
  const resetNavigation = useAppStore((state) => state.resetNavigation);
  // Falls back to data.initialFloorId until the init effect below writes the
  // store on mount, so the very first render (before effects run) shows the
  // right floor instead of a flash of "no floor selected".
  const activeFloorId = storedActiveFloorId ?? data.initialFloorId;

  // data.initialFloorId only changes on a real page load (a different floor's
  // server data) — never from in-app floor switching, which doesn't touch the
  // data prop — so this can't fire mid-session. It exists because
  // originNodeId/destinationNodeId/activeFloorId live in the single app-wide
  // store: without this, navigating client-side from one building's map to
  // another would leave a stale route/floor behind.
  useEffect(() => {
    resetNavigation();
    setActiveFloorId(data.initialFloorId);
  }, [data.initialFloorId, resetNavigation, setActiveFloorId]);

  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [showGrid, setShowGrid] = useState(false);
  const floors = data.floors;
  const activeFloor = floors.find((floor) => floor.id === activeFloorId) ?? null;
  const objects = activeFloor ? data.objectsByFloorId[activeFloor.id] ?? [] : [];
  const nodes = useMemo(
    () => (activeFloor ? data.nodesByFloorId[activeFloor.id] ?? [] : []),
    [activeFloor, data.nodesByFloorId],
  );
  const edges = activeFloor ? data.edgesByFloorId[activeFloor.id] ?? [] : [];
  const {
    changeZoom,
    consumeSuppressedClick,
    focusWorldBounds,
    focusWorldPoint,
    isDragging,
    pan,
    resetView,
    viewportRef,
    zoom,
    handleSvgPointerDown,
    handleSvgPointerMove,
    handleSvgPointerUp,
    handleViewportPointerCancel,
    handleViewportPointerLeave,
    handleViewportPointerUp,
  } = useMapViewerViewport({
    activeFloor,
    activeFloorId,
    floors,
  });

  const {
    activeSegment,
    activeSegmentIndex,
    allNodes,
    effectiveOriginId,
    nodesById,
    route,
    routePoints,
    segments,
  } = useRoute(data);
  const setActiveSegmentIndex = useAppStore((state) => state.setActiveSegmentIndex);
  const originNodeId = useAppStore((state) => state.originNodeId);
  const setOrigin = useAppStore((state) => state.setOrigin);
  const routePointsForActiveFloor = activeSegment?.floorId === activeFloorId ? routePoints : undefined;
  const nextSegment = segments[activeSegmentIndex + 1] ?? null;
  const nextFloor = nextSegment ? floors.find((floor) => floor.id === nextSegment.floorId) ?? null : null;
  // Directions search spans the whole building — a destination on another
  // floor is exactly the case multi-floor routing exists for.
  const allSearchableObjects = Object.values(data.objectsByFloorId)
    .flat()
    .filter((object) => object.isSearchable);

  // Cross-floor edges are only stored under their origin floor's bucket, so
  // resolving a connector's target requires searching every floor's edges,
  // not just the active floor's.
  const allEdges = useMemo(
    () => Object.values(data.edgesByFloorId).flat(),
    [data.edgesByFloorId],
  );

  const connectorTargetsByNodeId = useMemo(() => {
    const map: Record<string, ConnectorTargetInfo> = {};

    for (const node of nodes) {
      if (!isConnectorNode(node)) {
        continue;
      }

      const target = findConnectorTarget(node, allEdges, nodesById);
      if (!target) {
        continue;
      }

      const floor = floors.find((candidate) => candidate.id === target.floorId);
      map[node.id] = {
        floorId: target.floorId,
        floorName: floor?.name ?? "another floor",
        targetNode: target.node,
      };
    }

    return map;
  }, [nodes, allEdges, nodesById, floors]);

  // The one place "current floor" changes when the caller doesn't already
  // know a specific route segment index (header, sidebar, canvas connector
  // jump) — keeps activeFloorId and activeSegmentIndex from drifting apart,
  // which used to hide the route line and desync the breadcrumb/route panel
  // "you're here" highlight from whatever floor was actually on screen.
  const goToFloor = (floorId: string) => {
    setActiveFloorId(floorId);
    setSelectedObjectId(null);

    const matchingSegmentIndex = segments.findIndex((segment) => segment.floorId === floorId);
    if (matchingSegmentIndex !== -1) {
      setActiveSegmentIndex(matchingSegmentIndex);
    }
  };

  const handleFloorChange = (floorId: string) => {
    goToFloor(floorId);
    setSearch("");
  };

  const handleConnectorJump = (target: ConnectorTargetInfo) => {
    focusWorldBounds({
      maxX: target.targetNode.x + MAP_VIEWER_FLOOR_CONTENT_PADDING + CONNECTOR_JUMP_FOCUS_RADIUS,
      maxY: target.targetNode.y + MAP_VIEWER_FLOOR_CONTENT_PADDING + CONNECTOR_JUMP_FOCUS_RADIUS,
      minX: target.targetNode.x + MAP_VIEWER_FLOOR_CONTENT_PADDING - CONNECTOR_JUMP_FOCUS_RADIUS,
      minY: target.targetNode.y + MAP_VIEWER_FLOOR_CONTENT_PADDING - CONNECTOR_JUMP_FOCUS_RADIUS,
    });
    goToFloor(target.floorId);
  };

  const handleJumpToSegment = (index: number) => {
    const segment = segments[index];
    if (!segment) {
      return;
    }

    setActiveSegmentIndex(index);
    setActiveFloorId(segment.floorId);

    const bounds = getRouteSegmentBounds(segment, nodesById);
    if (bounds) {
      focusWorldBounds(bounds);
    }
  };

  const selectedObject = objects.find((object) => object.id === selectedObjectId) ?? null;
  const searchableObjects = objects
    .filter((object) => object.isSearchable)
    .filter((object) => {
      if (!deferredSearch.trim()) {
        return true;
      }

      const query = deferredSearch.trim().toLowerCase();
      return (
        object.name.toLowerCase().includes(query)
        || object.label.toLowerCase().includes(query)
        || object.type.toLowerCase().includes(query)
      );
    })
    .slice(0, 14);

  const focusObject = (object: ViewerMapObject) => {
    setSelectedObjectId(object.id);
    focusWorldPoint({
      x: MAP_VIEWER_FLOOR_CONTENT_PADDING + object.x + object.width / 2,
      y: MAP_VIEWER_FLOOR_CONTENT_PADDING + object.y + object.height / 2,
    });

    // No starting point chosen yet — treat the first thing you click (on
    // the map or in the Places list) as "that's where I am", instead of
    // requiring an explicit "Start here" tap for the common first click.
    // Once an origin exists, further clicks just select/inspect as normal.
    if (!originNodeId) {
      const nodeId = findNodeIdForObject(object.id, allNodes);
      if (nodeId) {
        setOrigin(nodeId);
      }
    }
  };

  const handleBackgroundClick = () => {
    if (consumeSuppressedClick()) {
      return;
    }

    setSelectedObjectId(null);
  };

  const handleObjectSelect = (object: ViewerMapObject) => {
    if (consumeSuppressedClick()) {
      return;
    }

    focusObject(object);
  };

  return (
    <section
      className={["min-h-screen bg-background text-foreground md:h-dvh md:overflow-hidden", MAP_VIEWER_THEME_CLASSNAMES].join(" ")}
    >
      <div className="flex min-h-screen flex-col md:h-full md:min-h-0">
        <MapViewerPageHeader activeFloor={activeFloor} floors={floors} onFloorChange={handleFloorChange} />

        {/* Below md, the page scrolls as a whole (map, then sidebar) — there
            isn't room for both to be independently fixed-height on a phone
            screen. At md and up (tablet and desktop), this row is
            height-bounded so only the sidebar scrolls internally and the map
            stays fixed in place, matching the editor's layout. */}
        <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-0 p-0 sm:gap-4 sm:p-6 md:grid md:min-h-0 md:grid-cols-[300px_minmax(0,1fr)] lg:grid-cols-[340px_minmax(0,1fr)]">
          <MapViewerSidebar
            activeFloor={activeFloor}
            activeFloorId={activeFloorId}
            floors={floors}
            onFloorChange={handleFloorChange}
            onFocusObject={focusObject}
            onSearchChange={setSearch}
            routePanelSlot={(
              <RoutePanel
                activeSegmentIndex={activeSegmentIndex}
                effectiveOriginId={effectiveOriginId}
                floors={floors}
                nodes={allNodes}
                onJumpToSegment={handleJumpToSegment}
                route={route}
                searchableObjects={allSearchableObjects}
                segments={segments}
              />
            )}
            search={search}
            searchableObjects={searchableObjects}
            selectedObject={selectedObject}
            selectedObjectId={selectedObjectId}
            selectionActionsSlot={selectedObject ? (
              <RouteOriginTrigger
                label={selectedObject.label || selectedObject.name}
                nodeId={findNodeIdForObject(selectedObject.id, nodes)}
              />
            ) : null}
          />

          <main className="order-1 relative h-[calc(100dvh-7.5rem)] min-h-[calc(100dvh-7.5rem)] overflow-hidden border-x-0 border-t-0 border-b border-border bg-[var(--map-viewer-canvas)] shadow-sm sm:h-[calc(100dvh-8.5rem)] sm:min-h-[calc(100dvh-8.5rem)] sm:rounded-3xl sm:border md:order-none md:h-full md:min-h-0 lg:rounded-4xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_32%),linear-gradient(to_right,var(--map-viewer-grid-minor)_1px,transparent_1px),linear-gradient(to_bottom,var(--map-viewer-grid-minor)_1px,transparent_1px)] [background-size:auto,28px_28px,28px_28px]" />
            <MapViewerToolbar
              activeFloor={activeFloor}
              activeSegmentIndex={activeSegmentIndex}
              floors={floors}
              onJumpToSegment={handleJumpToSegment}
              onResetView={resetView}
              onToggleGrid={() => setShowGrid((current) => !current)}
              onZoomChange={changeZoom}
              segments={segments}
              showGrid={showGrid}
            />
            <MapViewerCanvas
              activeFloor={activeFloor}
              connectorTargetsByNodeId={connectorTargetsByNodeId}
              edges={edges}
              isDragging={isDragging}
              nodes={nodes}
              objects={objects}
              onBackgroundClick={handleBackgroundClick}
              onConnectorActivate={handleConnectorJump}
              onObjectSelect={handleObjectSelect}
              onPointerCancel={handleViewportPointerCancel}
              onPointerLeave={handleViewportPointerLeave}
              onPointerUp={handleViewportPointerUp}
              onSvgPointerDown={handleSvgPointerDown}
              onSvgPointerMove={handleSvgPointerMove}
              onSvgPointerUp={handleSvgPointerUp}
              pan={pan}
              routePoints={routePointsForActiveFloor}
              selectedObjectId={selectedObjectId}
              showGrid={showGrid}
              viewportRef={viewportRef}
              zoom={zoom}
            />
            {selectedObject ? (
              <MapSelectionBar
                label={selectedObject.label || selectedObject.name}
                nodeId={findNodeIdForObject(selectedObject.id, allNodes)}
                onClose={() => setSelectedObjectId(null)}
              />
            ) : null}
            {nextSegment && nextFloor ? (
              <FloorHopIndicator
                edgeType={nextSegment.enterViaEdgeType}
                floorName={nextFloor.name}
                onAdvance={() => handleJumpToSegment(activeSegmentIndex + 1)}
              />
            ) : null}
          </main>
        </div>
      </div>
    </section>
  );
}
