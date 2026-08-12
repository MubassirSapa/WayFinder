import type {
  PointerEventHandler,
  RefObject,
} from "react";

import { buildPanZoomTransform } from "../lib/mapViewerTransform";
import { getRenderedFloorSize } from "../lib/mapViewerViewport";
import { useDefaultMapViewerViewportState, type ViewportState } from "../store/useMapViewerViewportState";
import type {
  ConnectorDirection,
  ConnectorTargetInfo,
  ViewerFloor,
  ViewerMapNode,
  ViewerMapObject,
  ViewerPathEdge,
} from "../types/map-viewer.types";
import { MapViewerSvg } from "./MapViewerSvg";

interface MapViewerCanvasProps {
  activeFloor: ViewerFloor | null;
  connectorTargetsByNodeId: Record<string, ConnectorTargetInfo[]>;
  contentRef: RefObject<HTMLDivElement | null>;
  destinationObjectId: string | null;
  edges: ViewerPathEdge[];
  nodes: ViewerMapNode[];
  objects: ViewerMapObject[];
  originObjectId: string | null;
  routeConnectorDirection: ConnectorDirection | null;
  routeConnectorNodeId: string | null;
  routeHasDestination?: boolean;
  routeHasStart?: boolean;
  routePoints?: { x: number; y: number }[];
  selectedObjectId: string | null;
  showGrid: boolean;
  useViewportState?: () => ViewportState;
  viewportRef: RefObject<HTMLDivElement | null>;
  onBackgroundClick: () => void;
  onConnectorActivate: (node: ViewerMapNode, targets: ConnectorTargetInfo[]) => void;
  onObjectSelect: (object: ViewerMapObject) => void;
  onPointerCancel: PointerEventHandler<HTMLDivElement>;
  onPointerDown: PointerEventHandler<HTMLDivElement>;
  onPointerLeave: PointerEventHandler<HTMLDivElement>;
  onPointerMove: PointerEventHandler<HTMLDivElement>;
  onPointerUp: PointerEventHandler<HTMLDivElement>;
}

export function MapViewerCanvas({
  activeFloor,
  connectorTargetsByNodeId,
  contentRef,
  destinationObjectId,
  edges,
  nodes,
  objects,
  originObjectId,
  routeConnectorDirection,
  routeConnectorNodeId,
  routeHasDestination,
  routeHasStart,
  routePoints,
  selectedObjectId,
  showGrid,
  useViewportState = useDefaultMapViewerViewportState,
  viewportRef,
  onBackgroundClick,
  onConnectorActivate,
  onObjectSelect,
  onPointerCancel,
  onPointerDown,
  onPointerLeave,
  onPointerMove,
  onPointerUp,
}: MapViewerCanvasProps) {
  // Injected as a hook, not resolved values, so the subscription itself
  // stays scoped to just this component - the rest of the page (sidebar,
  // header, toolbar) never re-renders on a pan/zoom tick. The dashboard QR
  // viewer passes its own hook reading an isolated store slice instead of
  // this default; see useMapViewerViewportState.ts.
  const { isDragging, pan, zoom } = useViewportState();
  const renderedSize = activeFloor ? getRenderedFloorSize(activeFloor) : null;

  return (
    <>
      <div
        className={[
          "relative h-full min-h-[62dvh] touch-none overflow-hidden bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--muted)_38%,transparent),transparent_22%)] md:min-h-[560px] lg:min-h-[680px]",
          "sm:min-h-[calc(100dvh-8.5rem)]",
          "before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--map-viewer-canvas)_88%,transparent),transparent_20%)]",
          isDragging ? "cursor-grabbing select-none" : "cursor-grab",
        ].join(" ")}
        onPointerCancel={onPointerCancel}
        onPointerDown={onPointerDown}
        onPointerLeave={onPointerLeave}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        ref={viewportRef}
      >
        {!activeFloor ? (
          <div className="flex h-full items-center justify-center px-6 text-center">
            <div className="max-w-md space-y-3">
              <h2 className="text-xl font-semibold">No published map yet</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Publish at least one floor from the admin side to render the public map viewer.
              </p>
            </div>
          </div>
        ) : (
          <div
            className="absolute left-0 top-0 will-change-transform"
            ref={contentRef}
            style={{
              height: renderedSize?.height,
              transform: buildPanZoomTransform(pan, zoom),
              transformOrigin: "0 0",
              width: renderedSize?.width,
            }}
          >
            <MapViewerSvg
              activeFloor={activeFloor}
              connectorTargetsByNodeId={connectorTargetsByNodeId}
              destinationObjectId={destinationObjectId}
              edges={edges}
              nodes={nodes}
              objects={objects}
              onBackgroundClick={onBackgroundClick}
              onConnectorActivate={onConnectorActivate}
              onObjectSelect={onObjectSelect}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              originObjectId={originObjectId}
              routeConnectorDirection={routeConnectorDirection}
              routeConnectorNodeId={routeConnectorNodeId}
              routeHasDestination={routeHasDestination}
              routeHasStart={routeHasStart}
              routePoints={routePoints}
              selectedObjectId={selectedObjectId}
              showGrid={showGrid}
            />
          </div>
        )}
      </div>

    </>
  );
}
