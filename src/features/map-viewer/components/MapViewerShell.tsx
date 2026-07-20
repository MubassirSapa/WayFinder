'use client';

import { useDeferredValue, useState } from "react";

import { FloorHopIndicator } from "@/features/navigation/components/FloorHopIndicator";
import { MapSelectionBar } from "@/features/navigation/components/MapSelectionBar";
import { RouteOriginTrigger } from "@/features/navigation/components/RouteOriginTrigger";
import { RoutePanel } from "@/features/navigation/components/RoutePanel";
import { useRoute } from "@/features/navigation/hooks/useRoute";
import { getRouteSegmentBounds } from "@/features/navigation/lib/routeBounds";
import { findNodeIdForObject } from "@/features/navigation/lib/findNodeForObject";
import { useNavigationStore } from "@/features/navigation/store/useNavigationStore";

import { MAP_VIEWER_FLOOR_CONTENT_PADDING } from "../constants/mapViewer.constants";
import { MAP_VIEWER_THEME_CLASSNAMES } from "../constants/mapViewerTheme.constants";
import { useMapViewerViewport } from "../hooks/useMapViewerViewport";
import type {
  MapViewerData,
  ViewerMapObject,
} from "../types/map-viewer.types";
import { MapViewerCanvas } from "./MapViewerCanvas";
import { MapViewerPageHeader } from "./MapViewerPageHeader";
import { MapViewerSidebar } from "./MapViewerSidebar";
import { MapViewerToolbar } from "./MapViewerToolbar";

interface MapViewerShellProps {
  data: MapViewerData;
}

export function MapViewerShell({ data }: MapViewerShellProps) {
  const [activeFloorId, setActiveFloorId] = useState(data.initialFloorId);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [showGrid, setShowGrid] = useState(false);
  const floors = data.floors;
  const activeFloor = floors.find((floor) => floor.id === activeFloorId) ?? null;
  const objects = activeFloor ? data.objectsByFloorId[activeFloor.id] ?? [] : [];
  const nodes = activeFloor ? data.nodesByFloorId[activeFloor.id] ?? [] : [];
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
  const setActiveSegmentIndex = useNavigationStore((state) => state.setActiveSegmentIndex);
  const originNodeId = useNavigationStore((state) => state.originNodeId);
  const setOrigin = useNavigationStore((state) => state.setOrigin);
  const routePointsForActiveFloor = activeSegment?.floorId === activeFloorId ? routePoints : undefined;
  const nextSegment = segments[activeSegmentIndex + 1] ?? null;
  const nextFloor = nextSegment ? floors.find((floor) => floor.id === nextSegment.floorId) ?? null : null;
  // Directions search spans the whole building — a destination on another
  // floor is exactly the case multi-floor routing exists for.
  const allSearchableObjects = Object.values(data.objectsByFloorId)
    .flat()
    .filter((object) => object.isSearchable);

  const handleFloorChange = (floorId: string) => {
    setActiveFloorId(floorId);
    setSelectedObjectId(null);
    setSearch("");
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
      className={["min-h-screen bg-background text-foreground lg:h-dvh lg:overflow-hidden", MAP_VIEWER_THEME_CLASSNAMES].join(" ")}
    >
      <div className="flex min-h-screen flex-col lg:h-full lg:min-h-0">
        <MapViewerPageHeader activeFloor={activeFloor} />

        {/* Below lg, the page scrolls as a whole (map, then sidebar) — there
            isn't room for both to be independently fixed-height on a phone
            screen. At lg and up, this row is height-bounded so only the
            sidebar scrolls internally and the map stays fixed in place,
            matching the editor's layout. */}
        <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-0 p-0 sm:gap-4 sm:p-6 lg:grid lg:min-h-0 lg:grid-cols-[340px_minmax(0,1fr)]">
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

          <main className="order-1 relative h-[calc(100dvh-7.5rem)] min-h-[calc(100dvh-7.5rem)] overflow-hidden border-x-0 border-t-0 border-b border-border bg-[var(--map-viewer-canvas)] shadow-sm sm:h-[calc(100dvh-8.5rem)] sm:min-h-[calc(100dvh-8.5rem)] sm:rounded-3xl sm:border lg:order-none lg:h-full lg:min-h-0 lg:rounded-4xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_32%),linear-gradient(to_right,var(--map-viewer-grid-minor)_1px,transparent_1px),linear-gradient(to_bottom,var(--map-viewer-grid-minor)_1px,transparent_1px)] [background-size:auto,28px_28px,28px_28px]" />
            <MapViewerToolbar
              activeFloor={activeFloor}
              onResetView={resetView}
              onToggleGrid={() => setShowGrid((current) => !current)}
              onZoomChange={changeZoom}
              showGrid={showGrid}
            />
            <MapViewerCanvas
              activeFloor={activeFloor}
              edges={edges}
              isDragging={isDragging}
              nodes={nodes}
              objects={objects}
              onBackgroundClick={handleBackgroundClick}
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
