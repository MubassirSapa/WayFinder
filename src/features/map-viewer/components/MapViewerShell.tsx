'use client';

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";

import { FloorHopIndicator } from "@/features/navigation/components/FloorHopIndicator";
import { MapSelectionBar } from "@/features/navigation/components/MapSelectionBar";
import { RoutePanel } from "@/features/navigation/components/RoutePanel";
import { RouteStatusIndicator } from "@/features/navigation/components/RouteStatusIndicator";
import { useRoute } from "@/features/navigation/hooks/useRoute";
import { getRouteSegmentBounds } from "@/features/navigation/lib/routeBounds";
import { findNodeIdForObject } from "@/features/navigation/lib/findNodeForObject";
import { useAppStore } from "@/store";

import { MAP_VIEWER_FLOOR_CONTENT_PADDING } from "../constants/mapViewer.constants";
import { MAP_VIEWER_THEME_CLASSNAMES } from "../constants/mapViewerTheme.constants";
import { findConnectorTargets, getConnectorType, type ConnectorType } from "../lib/connectors";
import { useMapViewerViewport } from "../hooks/useMapViewerViewport";
import type {
  ConnectorTargetInfo,
  MapViewerData,
  ViewerMapNode,
  ViewerMapObject,
} from "../types/map-viewer.types";
import { ConnectorFloorPickerDialog } from "./ConnectorFloorPickerDialog";
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
  // Mobile-only: the sidebar docks as a collapsed handle at the bottom of the
  // screen (map fully visible above it) and expands into a sheet over the
  // map when tapped or dragged up — ignored entirely at the md breakpoint
  // and above, where the sidebar is always a normal, always-visible column.
  const [isMobileSidebarExpanded, setIsMobileSidebarExpanded] = useState(false);
  const [connectorPicker, setConnectorPicker] = useState<{
    connectorType: ConnectorType;
    targets: ConnectorTargetInfo[];
  } | null>(null);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [showGrid, setShowGrid] = useState(false);
  // Stable reference for MapViewerToolbar (memoized) — the inline arrow this
  // replaced was a fresh function every MapViewerShell render, which defeats
  // memo on its own regardless of how stable the other props are.
  const handleToggleGrid = useCallback(() => {
    setShowGrid((current) => !current);
  }, []);
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
    contentRef,
    focusWorldBounds,
    focusWorldPoint,
    resetView,
    viewportRef,
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
  const destinationNodeId = useAppStore((state) => state.destinationNodeId);
  const accessibleOnly = useAppStore((state) => state.accessibleOnly);
  const setOrigin = useAppStore((state) => state.setOrigin);

  // Only resolves to an id when the origin/destination node is actually on
  // the floor currently displayed (nodes is already scoped to activeFloor) —
  // if you set an origin on floor 1 then switch to floor 2, nothing on floor
  // 2 should highlight as "the origin".
  const originObjectId = useMemo(
    () => nodes.find((node) => node.id === originNodeId)?.objectId ?? null,
    [nodes, originNodeId],
  );
  const destinationObjectId = useMemo(
    () => nodes.find((node) => node.id === destinationNodeId)?.objectId ?? null,
    [nodes, destinationNodeId],
  );

  // setOrigin/setDestination always reset activeSegmentIndex to 0 (the store
  // slice has no way to know which floor is active). That's wrong whenever a
  // route is set while already standing on a floor other than the route's
  // first segment (e.g. "Start here" on floor A, switch to floor B, "Route
  // here" on floor B) — segment 0 belongs to floor A, so routePointsForActiveFloor
  // below would never match floor B and the just-computed route wouldn't
  // draw at all until something else (a manual segment jump) happened to fix
  // activeSegmentIndex. Re-sync it here whenever the computed segments (or
  // the active floor) change, same matching logic goToFloor already uses.
  useEffect(() => {
    if (!activeFloorId || segments.length === 0) {
      return;
    }

    if (segments[activeSegmentIndex]?.floorId === activeFloorId) {
      return;
    }

    const matchingSegmentIndex = segments.findIndex((segment) => segment.floorId === activeFloorId);
    if (matchingSegmentIndex !== -1) {
      setActiveSegmentIndex(matchingSegmentIndex);
    }
  }, [segments, activeFloorId, activeSegmentIndex, setActiveSegmentIndex]);

  const routePointsForActiveFloor = activeSegment?.floorId === activeFloorId ? routePoints : undefined;
  const nextSegment = segments[activeSegmentIndex + 1] ?? null;
  const nextFloor = nextSegment ? floors.find((floor) => floor.id === nextSegment.floorId) ?? null : null;
  // The connector (stairs/elevator/escalator) this floor's segment exits
  // through — same condition FloorHopIndicator uses ("there's a next floor
  // to continue to from here") — highlighted on the map itself so the right
  // connector is obvious without reading the indicator text or tracing the
  // route line to its end.
  const routeConnectorNodeId = activeSegment?.floorId === activeFloorId && nextSegment
    ? activeSegment.nodeIds.at(-1) ?? null
    : null;
  const routeConnectorDirection = routeConnectorNodeId && nextFloor && activeFloor
    ? (nextFloor.level > activeFloor.level ? "up" as const : "down" as const)
    : null;
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
    const map: Record<string, ConnectorTargetInfo[]> = {};

    for (const node of nodes) {
      const targets = findConnectorTargets(node, allEdges, nodesById);
      if (targets.length === 0) {
        continue;
      }

      map[node.id] = targets.map((target) => {
        const floor = floors.find((candidate) => candidate.id === target.floorId);
        return {
          direction: (floor?.level ?? 0) > (activeFloor?.level ?? 0) ? "up" as const : "down" as const,
          floorId: target.floorId,
          floorName: floor?.name ?? "another floor",
          targetNode: target.node,
        };
      });
    }

    return map;
  }, [nodes, allEdges, nodesById, floors, activeFloor]);

  // The one place "current floor" changes when the caller doesn't already
  // know a specific route segment index (header, sidebar, canvas connector
  // jump) — keeps activeFloorId and activeSegmentIndex from drifting apart,
  // which used to hide the route line and desync the breadcrumb/route panel
  // "you're here" highlight from whatever floor was actually on screen.
  //
  // Wrapped in useCallback (and handleFloorChange/handleJumpToSegment below)
  // so MapViewerPageHeader/MapViewerToolbar (both memoized) see a stable
  // function reference across renders that don't actually change floor/route
  // state — e.g. selecting an object — instead of re-rendering every time.
  const goToFloor = useCallback((floorId: string) => {
    setActiveFloorId(floorId);
    setSelectedObjectId(null);

    const matchingSegmentIndex = segments.findIndex((segment) => segment.floorId === floorId);
    if (matchingSegmentIndex !== -1) {
      setActiveSegmentIndex(matchingSegmentIndex);
    }
  }, [segments, setActiveFloorId, setActiveSegmentIndex]);

  const handleFloorChange = useCallback((floorId: string) => {
    goToFloor(floorId);
    setSearch("");
  }, [goToFloor]);

  const focusConnectorTarget = (target: ConnectorTargetInfo) => {
    focusWorldBounds({
      maxX: target.targetNode.x + MAP_VIEWER_FLOOR_CONTENT_PADDING + CONNECTOR_JUMP_FOCUS_RADIUS,
      maxY: target.targetNode.y + MAP_VIEWER_FLOOR_CONTENT_PADDING + CONNECTOR_JUMP_FOCUS_RADIUS,
      minX: target.targetNode.x + MAP_VIEWER_FLOOR_CONTENT_PADDING - CONNECTOR_JUMP_FOCUS_RADIUS,
      minY: target.targetNode.y + MAP_VIEWER_FLOOR_CONTENT_PADDING - CONNECTOR_JUMP_FOCUS_RADIUS,
    });
    goToFloor(target.floorId);
  };

  const handleConnectorJump = (node: ViewerMapNode, targets: ConnectorTargetInfo[]) => {
    if (targets.length === 0) {
      return;
    }

    // Mid-route, double-clicking the connector that leads to the very next
    // segment's floor is "continue" — identical to FloorHopIndicator's
    // button — instead of an independent jump that might disagree with the
    // route's own progress if this connector happens to serve other floors
    // too.
    if (destinationNodeId && nextSegment) {
      const continuingTarget = targets.find((target) => target.floorId === nextSegment.floorId);
      if (continuingTarget) {
        handleJumpToSegment(activeSegmentIndex + 1);
        return;
      }
    }

    if (targets.length === 1) {
      focusConnectorTarget(targets[0]);
      return;
    }

    // More than one floor this connector could go to, and no active route
    // pointing at one of them — ask instead of guessing which edge to
    // follow.
    setConnectorPicker({ connectorType: getConnectorType(node.role) ?? "elevator", targets });
  };

  const handleConnectorFloorPicked = (floorId: string) => {
    const target = connectorPicker?.targets.find((candidate) => candidate.floorId === floorId);
    if (target) {
      focusConnectorTarget(target);
    }
  };

  const handleJumpToSegment = useCallback((index: number) => {
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
  }, [segments, setActiveSegmentIndex, setActiveFloorId, nodesById, focusWorldBounds]);

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

  const focusObject = (object: ViewerMapObject, options: { recenter?: boolean } = {}) => {
    setSelectedObjectId(object.id);
    if (options.recenter !== false) {
      focusWorldPoint({
        x: MAP_VIEWER_FLOOR_CONTENT_PADDING + object.x + object.width / 2,
        y: MAP_VIEWER_FLOOR_CONTENT_PADDING + object.y + object.height / 2,
      });
    }

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

    // Connectors are visible right where the user just clicked, and a
    // double-click needs the second tap to land on the same screen spot as
    // the first — recentering the viewport on selection (as other objects
    // do) would shift the connector out from under the cursor between the
    // two taps of that gesture.
    const isConnectorObject = object.type === "stairs" || object.type === "elevator" || object.type === "escalator";
    focusObject(object, { recenter: !isConnectorObject });
  };

  return (
    <section
      className={["h-dvh overflow-hidden bg-background text-foreground", MAP_VIEWER_THEME_CLASSNAMES].join(" ")}
    >
      <div className="flex h-full min-h-0 flex-col">
        <MapViewerPageHeader activeFloor={activeFloor} />

        {/* Below md, the sidebar is a fixed bottom sheet that docks as a
            collapsed handle (map fully visible above it) and expands over
            the map when tapped/dragged — never part of the page's normal
            flow, so there's nothing to scroll past to reach it. At md and
            up, it's a normal always-visible grid column, exactly as before. */}
        <div className="relative mx-auto flex w-full max-w-400 flex-1 flex-col gap-0 p-0 sm:gap-4 sm:p-6 md:grid md:min-h-0 md:grid-cols-[300px_minmax(0,1fr)] lg:grid-cols-[340px_minmax(0,1fr)]">
          {isMobileSidebarExpanded ? (
            <button
              aria-label="Collapse the map sidebar"
              className="fixed inset-0 z-20 bg-transparent md:hidden"
              onClick={() => setIsMobileSidebarExpanded(false)}
              type="button"
            />
          ) : null}

          <MapViewerSidebar
            activeFloor={activeFloor}
            activeFloorId={activeFloorId}
            floors={floors}
            isMobileExpanded={isMobileSidebarExpanded}
            onFloorChange={handleFloorChange}
            onFocusObject={focusObject}
            onMobileExpandedChange={setIsMobileSidebarExpanded}
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
          />

          <main className="order-1 relative min-h-0 flex-1 overflow-hidden border-x-0 border-t-0 border-b border-border bg-(--map-viewer-canvas) shadow-sm sm:rounded-3xl sm:border md:order-0 md:h-full md:min-h-0 lg:rounded-4xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_32%),linear-gradient(to_right,var(--map-viewer-grid-minor)_1px,transparent_1px),linear-gradient(to_bottom,var(--map-viewer-grid-minor)_1px,transparent_1px)] bg-size-[auto,28px_28px,28px_28px]" />
            <MapViewerToolbar
              activeFloor={activeFloor}
              activeSegmentIndex={activeSegmentIndex}
              floors={floors}
              onFloorChange={handleFloorChange}
              onJumpToSegment={handleJumpToSegment}
              onResetView={resetView}
              onToggleGrid={handleToggleGrid}
              onZoomChange={changeZoom}
              segments={segments}
              showGrid={showGrid}
            />
            <MapViewerCanvas
              activeFloor={activeFloor}
              connectorTargetsByNodeId={connectorTargetsByNodeId}
              contentRef={contentRef}
              destinationObjectId={destinationObjectId}
              edges={edges}
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
              originObjectId={originObjectId}
              routeConnectorDirection={routeConnectorDirection}
              routeConnectorNodeId={routeConnectorNodeId}
              routeHasDestination={Boolean(routePointsForActiveFloor) && activeSegmentIndex === segments.length - 1}
              routeHasStart={Boolean(routePointsForActiveFloor) && activeSegmentIndex === 0}
              routePoints={routePointsForActiveFloor}
              selectedObjectId={selectedObjectId}
              showGrid={showGrid}
              viewportRef={viewportRef}
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
                direction={routeConnectorDirection ?? "up"}
                edgeType={nextSegment.enterViaEdgeType}
                floorName={nextFloor.name}
                onAdvance={() => handleJumpToSegment(activeSegmentIndex + 1)}
              />
            ) : destinationNodeId ? (
              <RouteStatusIndicator
                accessibleOnly={accessibleOnly}
                distanceMeters={route?.totalDistanceMeters}
                found={Boolean(route)}
              />
            ) : null}
          </main>
        </div>
      </div>

      {connectorPicker ? (
        <ConnectorFloorPickerDialog
          connectorType={connectorPicker.connectorType}
          onOpenChange={(open) => {
            if (!open) {
              setConnectorPicker(null);
            }
          }}
          onSelectFloor={handleConnectorFloorPicked}
          open
          targets={connectorPicker.targets}
        />
      ) : null}
    </section>
  );
}
