import type {
  PointerEventHandler,
  RefObject,
} from "react";

import { useAppStore } from "@/store";

import { buildPanZoomTransform } from "../lib/mapViewerTransform";
import { getRenderedFloorSize } from "../lib/mapViewerViewport";
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
  edges: ViewerPathEdge[];
  nodes: ViewerMapNode[];
  objects: ViewerMapObject[];
  routeConnectorDirection: ConnectorDirection | null;
  routeConnectorNodeId: string | null;
  routePoints?: { x: number; y: number }[];
  selectedObjectId: string | null;
  showGrid: boolean;
  viewportRef: RefObject<HTMLDivElement | null>;
  onBackgroundClick: () => void;
  onConnectorActivate: (node: ViewerMapNode, targets: ConnectorTargetInfo[]) => void;
  onObjectPan: (deltaX: number, deltaY: number) => void;
  onObjectSelect: (object: ViewerMapObject) => void;
  onPointerCancel: PointerEventHandler<HTMLDivElement>;
  onPointerLeave: PointerEventHandler<HTMLDivElement>;
  onPointerUp: PointerEventHandler<HTMLDivElement>;
  onSvgPointerDown: PointerEventHandler<SVGSVGElement>;
  onSvgPointerMove: PointerEventHandler<SVGSVGElement>;
  onSvgPointerUp: PointerEventHandler<SVGSVGElement>;
}

export function MapViewerCanvas({
  activeFloor,
  connectorTargetsByNodeId,
  contentRef,
  edges,
  nodes,
  objects,
  routeConnectorDirection,
  routeConnectorNodeId,
  routePoints,
  selectedObjectId,
  showGrid,
  viewportRef,
  onBackgroundClick,
  onConnectorActivate,
  onObjectPan,
  onObjectSelect,
  onPointerCancel,
  onPointerLeave,
  onPointerUp,
  onSvgPointerDown,
  onSvgPointerMove,
  onSvgPointerUp,
}: MapViewerCanvasProps) {
  // Scoped to just this component so a pan/zoom tick only re-renders the
  // canvas — the rest of the page (sidebar, header, toolbar) never reads
  // these and stays untouched. During an active drag/pinch/wheel gesture the
  // visual transform is already applied straight to contentRef's DOM node
  // (see useMapViewerViewportGestures); this render just needs to agree with
  // that value once React catches up, and to drive the "Zoom X%" readout.
  const pan = useAppStore((state) => state.viewportPan);
  const zoom = useAppStore((state) => state.viewportZoom);
  const isDragging = useAppStore((state) => state.isViewportDragging);
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
        onPointerLeave={onPointerLeave}
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
              edges={edges}
              nodes={nodes}
              objects={objects}
              onBackgroundClick={onBackgroundClick}
              onConnectorActivate={onConnectorActivate}
              onObjectPan={onObjectPan}
              onObjectSelect={onObjectSelect}
              onPointerDown={onSvgPointerDown}
              onPointerMove={onSvgPointerMove}
              onPointerUp={onSvgPointerUp}
              routeConnectorDirection={routeConnectorDirection}
              routeConnectorNodeId={routeConnectorNodeId}
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
