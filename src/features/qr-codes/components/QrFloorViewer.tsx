"use client";

import { useEffect, useRef, useState } from "react";

import { MapViewerCanvas } from "@/features/map-viewer/components/MapViewerCanvas";
import { MAP_VIEWER_THEME_CLASSNAMES } from "@/features/map-viewer/constants/mapViewerTheme.constants";
import { useMapViewerViewport } from "@/features/map-viewer/hooks/useMapViewerViewport";
import type { MapViewerData, ViewerMapObject } from "@/features/map-viewer/types/map-viewer.types";

import { QR_CODES_CLIENT } from "../constants/qrCodes.constants";
import { qrViewerViewportBinding } from "../store/qrViewerViewportBinding";
import { useQrViewerViewportState } from "../store/useQrViewerViewportState";
import { QrCodeDialog } from "./QrCodeDialog";

interface QrFloorViewerProps {
  data: MapViewerData;
}

// A read-only render of a single floor, driven by the exact same
// MapViewerCanvas/MapViewerSvg/useMapViewerViewport stack the public /map
// viewer uses - only the state binding differs (the isolated qrViewer*
// slice, not the navigation one), so this looks and feels identical to
// scanning around the real viewer without touching any navigation state.
// See docs/technical/DASHBOARD_QR_VIEWER.md.
export function QrFloorViewer({ data }: QrFloorViewerProps) {
  const activeFloor = data.floors[0] ?? null;
  const activeFloorId = activeFloor?.id ?? null;
  const objects = activeFloorId ? data.objectsByFloorId[activeFloorId] ?? [] : [];
  const nodes = activeFloorId ? data.nodesByFloorId[activeFloorId] ?? [] : [];
  const edges = activeFloorId ? data.edgesByFloorId[activeFloorId] ?? [] : [];

  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);

  // On large screens the shell is tall enough (h-[70dvh]) that its bottom
  // can land below the fold beneath the sticky topbar/back-link/header
  // above it - scroll it fully into view once on mount, but only if it's
  // actually cut off and only above the lg breakpoint (on small screens the
  // page is expected to scroll normally).
  useEffect(() => {
    const node = shellRef.current;
    if (!node) {
      return;
    }
    if (!window.matchMedia("(min-width: 1024px)").matches) {
      return;
    }
    if (node.getBoundingClientRect().bottom > window.innerHeight) {
      node.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, []);

  const {
    consumeSuppressedClick,
    contentRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleViewportPointerCancel,
    handleViewportPointerLeave,
    viewportRef,
  } = useMapViewerViewport({
    activeFloor,
    activeFloorId,
    floors: data.floors,
    viewportBinding: qrViewerViewportBinding,
  });

  const selectedObject = objects.find((object) => object.id === selectedObjectId) ?? null;

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
    setSelectedObjectId(object.id);
  };

  return (
    <div
      ref={shellRef}
      className={[
        "relative h-105 overflow-hidden rounded-3xl border border-border bg-(--map-viewer-canvas) shadow-sm sm:h-130 md:h-150 lg:h-170",
        MAP_VIEWER_THEME_CLASSNAMES,
      ].join(" ")}
    >
      <MapViewerCanvas
        activeFloor={activeFloor}
        connectorTargetsByNodeId={{}}
        contentRef={contentRef}
        destinationObjectId={null}
        edges={edges}
        nodes={nodes}
        objects={objects}
        onBackgroundClick={handleBackgroundClick}
        onConnectorActivate={() => {}}
        onObjectSelect={handleObjectSelect}
        onPointerCancel={handleViewportPointerCancel}
        onPointerDown={handlePointerDown}
        onPointerLeave={handleViewportPointerLeave}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        originObjectId={null}
        routeConnectorDirection={null}
        routeConnectorNodeId={null}
        selectedObjectId={selectedObjectId}
        showGrid={false}
        useViewportState={useQrViewerViewportState}
        viewportRef={viewportRef}
      />

      {selectedObject ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center px-4">
          <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur-xl">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{selectedObject.label || selectedObject.name}</p>
              {!selectedObject.isSearchable ? (
                <p className="text-xs text-muted-foreground">{QR_CODES_CLIENT.NOT_SEARCHABLE}</p>
              ) : null}
            </div>
            {selectedObject.isSearchable ? (
              <QrCodeDialog
                buildingName={activeFloor?.buildingName ?? null}
                objectId={selectedObject.id}
                objectName={selectedObject.label || selectedObject.name}
                organizationName={activeFloor?.organizationName ?? null}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
