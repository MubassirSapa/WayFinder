'use client';

import { useDeferredValue, useState } from "react";

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
  const activeFloorId = data.initialFloorId;
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
    handleViewportWheel,
  } = useMapViewerViewport({
    activeFloor,
    activeFloorId,
    floors,
  });

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
      className={["min-h-screen bg-background text-foreground", MAP_VIEWER_THEME_CLASSNAMES].join(" ")}
    >
      <div className="flex min-h-screen flex-col">
        <MapViewerPageHeader activeFloor={activeFloor} />

        <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-0 p-0 sm:gap-4 sm:p-6 lg:grid lg:grid-cols-[340px_minmax(0,1fr)]">
          <MapViewerSidebar
            activeFloor={activeFloor}
            activeFloorId={activeFloorId}
            floors={floors}
            onFloorChange={() => {
              setSelectedObjectId(null);
              setSearch("");
            }}
            onFocusObject={focusObject}
            onSearchChange={setSearch}
            search={search}
            searchableObjects={searchableObjects}
            selectedObject={selectedObject}
            selectedObjectId={selectedObjectId}
          />

          <main className="order-1 relative h-[calc(100dvh-7.5rem)] min-h-[calc(100dvh-7.5rem)] overflow-hidden border-x-0 border-t-0 border-b border-border bg-[var(--map-viewer-canvas)] shadow-sm sm:h-[calc(100dvh-8.5rem)] sm:min-h-[calc(100dvh-8.5rem)] sm:rounded-3xl sm:border lg:order-none lg:h-auto lg:min-h-[680px] lg:rounded-4xl">
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
              onWheel={handleViewportWheel}
              pan={pan}
              selectedObjectId={selectedObjectId}
              showGrid={showGrid}
              viewportRef={viewportRef}
              zoom={zoom}
            />
          </main>
        </div>
      </div>
    </section>
  );
}
