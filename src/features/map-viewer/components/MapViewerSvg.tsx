import { memo, useRef } from "react";
import type { MouseEvent, PointerEvent, PointerEventHandler } from "react";

import { MAP_VIEWER_DRAG_THRESHOLD, MAP_VIEWER_FLOOR_CONTENT_PADDING } from "../constants/mapViewer.constants";
import { useConnectorDoublePress } from "../hooks/useConnectorDoublePress";
import {
  getViewerEdgePalette,
  getViewerNodePalette,
  getViewerObjectPalette,
  isNodePublicMarker,
} from "../lib/mapStyles";
import { getRenderedFloorSize } from "../lib/mapViewerViewport";
import type {
  ConnectorTargetInfo,
  ViewerFloor,
  ViewerMapNode,
  ViewerMapObject,
  ViewerPathEdge,
} from "../types/map-viewer.types";

interface MapViewerSvgProps {
  activeFloor: ViewerFloor;
  connectorTargetsByNodeId: Record<string, ConnectorTargetInfo[]>;
  edges: ViewerPathEdge[];
  nodes: ViewerMapNode[];
  objects: ViewerMapObject[];
  routePoints?: { x: number; y: number }[];
  selectedObjectId: string | null;
  showGrid: boolean;
  onBackgroundClick: () => void;
  onConnectorActivate: (node: ViewerMapNode, targets: ConnectorTargetInfo[]) => void;
  onObjectPan: (deltaX: number, deltaY: number) => void;
  onObjectSelect: (object: ViewerMapObject) => void;
  onPointerDown: PointerEventHandler<SVGSVGElement>;
  onPointerMove: PointerEventHandler<SVGSVGElement>;
  onPointerUp: PointerEventHandler<SVGSVGElement>;
}

// Memoized because MapViewerCanvas re-renders on every committed pan/zoom
// tick (see useMapViewerViewportGestures.ts) — none of this component's
// props depend on pan/zoom (the transform lives one level up, on the
// wrapping div), so without this, every one of those ticks would re-run the
// .map() over every object/node/edge for no visual reason.
export const MapViewerSvg = memo(function MapViewerSvg({
  activeFloor,
  connectorTargetsByNodeId,
  edges,
  nodes,
  objects,
  routePoints,
  selectedObjectId,
  showGrid,
  onBackgroundClick,
  onConnectorActivate,
  onObjectPan,
  onObjectSelect,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: MapViewerSvgProps) {
  const renderedSize = getRenderedFloorSize(activeFloor);

  return (
    <svg
      className="overflow-visible bg-transparent"
      height={renderedSize.height}
      onClick={onBackgroundClick}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      width={renderedSize.width}
    >
      <defs>
        <pattern
          height="24"
          id="viewer-grid"
          patternUnits="userSpaceOnUse"
          width="24"
        >
          <path
            d="M 24 0 L 0 0 0 24"
            fill="none"
            stroke="var(--map-viewer-grid-minor)"
            strokeWidth="1"
          />
        </pattern>
        <pattern
          height="120"
          id="viewer-grid-major"
          patternUnits="userSpaceOnUse"
          width="120"
        >
          <rect fill="url(#viewer-grid)" height="120" width="120" />
          <path
            d="M 120 0 L 0 0 0 120"
            fill="none"
            stroke="var(--map-viewer-grid-major)"
            strokeWidth="1.1"
          />
        </pattern>
      </defs>

      <rect
        fill="var(--map-viewer-floor-fill)"
        height={renderedSize.height}
        rx="18"
        stroke="var(--map-viewer-floor-stroke)"
        strokeWidth="2.25"
        vectorEffect="non-scaling-stroke"
        width={renderedSize.width}
      />

      <rect
        fill="none"
        height={Math.max(renderedSize.height - 32, 0)}
        rx="14"
        stroke="var(--map-viewer-floor-inner-stroke)"
        strokeWidth="1.4"
        vectorEffect="non-scaling-stroke"
        width={Math.max(renderedSize.width - 32, 0)}
        x="16"
        y="16"
      />

      {showGrid ? (
        <rect
          fill="url(#viewer-grid-major)"
          height={activeFloor.height}
          rx="12"
          width={activeFloor.width}
          x={MAP_VIEWER_FLOOR_CONTENT_PADDING}
          y={MAP_VIEWER_FLOOR_CONTENT_PADDING}
        />
      ) : null}

      <ViewerFloorContent
        connectorTargetsByNodeId={connectorTargetsByNodeId}
        edges={edges}
        nodes={nodes}
        objects={objects}
        onConnectorActivate={onConnectorActivate}
        onObjectPan={onObjectPan}
        onObjectSelect={onObjectSelect}
        routePoints={routePoints}
        selectedObjectId={selectedObjectId}
      />
    </svg>
  );
});

function ViewerFloorContent({
  connectorTargetsByNodeId,
  edges,
  nodes,
  objects,
  onConnectorActivate,
  onObjectPan,
  onObjectSelect,
  routePoints,
  selectedObjectId,
}: {
  connectorTargetsByNodeId: Record<string, ConnectorTargetInfo[]>;
  edges: ViewerPathEdge[];
  nodes: ViewerMapNode[];
  objects: ViewerMapObject[];
  onConnectorActivate: (node: ViewerMapNode, targets: ConnectorTargetInfo[]) => void;
  onObjectPan: (deltaX: number, deltaY: number) => void;
  onObjectSelect: (object: ViewerMapObject) => void;
  routePoints?: { x: number; y: number }[];
  selectedObjectId: string | null;
}) {
  // Shared between the node markers and their (much bigger, easier to hit)
  // parent objects, so a first press on either half of a connector counts
  // toward the same double-press.
  const { handlePress, pendingNodeId } = useConnectorDoublePress(onConnectorActivate);

  return (
    <g
      opacity="0.92"
      transform={`translate(${MAP_VIEWER_FLOOR_CONTENT_PADDING}, ${MAP_VIEWER_FLOOR_CONTENT_PADDING})`}
    >
      <ViewerEdges edges={edges} nodes={nodes} />
      <ViewerObjects
        connectorTargetsByNodeId={connectorTargetsByNodeId}
        nodes={nodes}
        objects={objects}
        onConnectorPress={handlePress}
        onPan={onObjectPan}
        onSelect={onObjectSelect}
        selectedObjectId={selectedObjectId}
      />
      <ViewerNodes
        connectorTargetsByNodeId={connectorTargetsByNodeId}
        nodes={nodes}
        onConnectorPress={handlePress}
        pendingNodeId={pendingNodeId}
      />
      {routePoints && routePoints.length > 1 ? <RoutePolyline points={routePoints} /> : null}
    </g>
  );
}

function RoutePolyline({ points }: { points: { x: number; y: number }[] }) {
  const origin = points[0];
  const destination = points[points.length - 1];

  return (
    <g>
      <defs>
        <marker
          id="route-direction-arrow"
          markerHeight="10"
          markerUnits="userSpaceOnUse"
          markerWidth="10"
          orient="auto"
          refX="5"
          refY="5"
          viewBox="0 0 10 10"
        >
          <path d="M1,1 L9,5 L1,9 L3.4,5 Z" fill="var(--map-viewer-route-line)" />
        </marker>
      </defs>
      {/* Dashes "flow" toward the destination (marching-ants effect) and an
          arrowhead points the final direction of travel, so which way to
          walk is obvious at a glance instead of just a static line. */}
      <polyline
        className="animate-[wf-route-flow_1.2s_linear_infinite]"
        fill="none"
        markerEnd="url(#route-direction-arrow)"
        points={points.map((point) => `${point.x},${point.y}`).join(" ")}
        stroke="var(--map-viewer-route-line)"
        strokeDasharray="10 6"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={4}
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={origin.x} cy={origin.y} fill="var(--map-viewer-route-origin)" r="7" stroke="var(--background)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <circle cx={destination.x} cy={destination.y} fill="var(--map-viewer-route-destination)" r="7" stroke="var(--background)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </g>
  );
}

function ViewerObjects({
  connectorTargetsByNodeId,
  nodes,
  objects,
  onConnectorPress,
  onPan,
  onSelect,
  selectedObjectId,
}: {
  connectorTargetsByNodeId: Record<string, ConnectorTargetInfo[]>;
  nodes: ViewerMapNode[];
  objects: ViewerMapObject[];
  onConnectorPress: (node: ViewerMapNode, targets: ConnectorTargetInfo[]) => void;
  onPan: (deltaX: number, deltaY: number) => void;
  onSelect: (object: ViewerMapObject) => void;
  selectedObjectId: string | null;
}) {
  return (
    <g>
      {objects.map((object) => {
        // Stairs/elevator/escalator objects are a much bigger, easier target
        // than their connector node marker — clicking anywhere on the shape
        // triggers the same double-press-to-jump instead of only working on
        // the small dot. The hint pill itself is left to the node marker
        // (rendered right at the connector point) so the two don't stack.
        const connectorNode = nodes.find((node) => node.objectId === object.id);
        const connectorTargets = connectorNode ? connectorTargetsByNodeId[connectorNode.id] : undefined;

        return (
          <ViewerObjectItem
            connectorNode={connectorNode}
            connectorTargets={connectorTargets}
            isSelected={selectedObjectId === object.id}
            key={object.id}
            object={object}
            onConnectorPress={onConnectorPress}
            onPan={onPan}
            onSelect={onSelect}
          />
        );
      })}
    </g>
  );
}

function ViewerObjectItem({
  connectorNode,
  connectorTargets,
  isSelected,
  object,
  onConnectorPress,
  onPan,
  onSelect,
}: {
  connectorNode: ViewerMapNode | undefined;
  connectorTargets: ConnectorTargetInfo[] | undefined;
  isSelected: boolean;
  object: ViewerMapObject;
  onConnectorPress: (node: ViewerMapNode, targets: ConnectorTargetInfo[]) => void;
  onPan: (deltaX: number, deltaY: number) => void;
  onSelect: (object: ViewerMapObject) => void;
}) {
  const palette = getViewerObjectPalette(object.type);
  const centerX = object.width / 2;
  const centerY = object.height / 2;

  // A press that turns into a real drag should pan the map exactly like
  // starting the drag on empty canvas would — objects aren't draggable in
  // the public viewer, so there's nothing else that gesture could mean. This
  // is tracked locally (not left to the SVG's own background-drag handling)
  // because this element keeps its own pointer capture below specifically so
  // its native click stays reliable: once a pointer is captured by a
  // different element (like the SVG, if its pan handler had captured it
  // instead), the browser retargets the resulting click there too — so an
  // object press would silently stop selecting anything.
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const hasDraggedRef = useRef(false);

  const handlePointerDown = (event: PointerEvent<SVGGElement>) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    hasDraggedRef.current = false;
  };

  const handlePointerMove = (event: PointerEvent<SVGGElement>) => {
    const start = dragStartRef.current;
    if (!start) {
      return;
    }

    if (!hasDraggedRef.current) {
      const distance = Math.hypot(event.clientX - start.x, event.clientY - start.y);
      if (distance > MAP_VIEWER_DRAG_THRESHOLD) {
        hasDraggedRef.current = true;
      }
    }

    if (hasDraggedRef.current) {
      onPan(event.movementX, event.movementY);
    }
  };

  const handlePointerEnd = (event: PointerEvent<SVGGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragStartRef.current = null;
  };

  const handleClick = (event: MouseEvent<SVGGElement>) => {
    event.stopPropagation();

    if (hasDraggedRef.current) {
      // That press turned into a pan, not a tap — don't also select.
      hasDraggedRef.current = false;
      return;
    }

    // A connector is a routable object like any other — select it first (so
    // "Start here"/"Route here" works) — and, if it has a cross-floor edge,
    // also feed the same click into the double-press-to-jump tracker.
    onSelect(object);
    if (connectorNode && connectorTargets && connectorTargets.length > 0) {
      onConnectorPress(connectorNode, connectorTargets);
    }
  };

  return (
    <g
      onClick={handleClick}
      onPointerCancel={handlePointerEnd}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      transform={`translate(${object.x}, ${object.y}) rotate(${object.rotation}, ${centerX}, ${centerY})`}
    >
      {object.shape === "polygon" ? (
        <polygon
          fill={palette.fill}
          points={(
            (object.points?.length ?? 0) >= 3
              ? object.points!
              : [
                  { x: 0, y: 0 },
                  { x: object.width, y: 0 },
                  { x: object.width, y: object.height },
                  { x: 0, y: object.height },
                ]
          )
            .map((point) => `${point.x},${point.y}`)
            .join(" ")}
          stroke={isSelected ? "var(--primary)" : palette.stroke}
          strokeWidth={isSelected ? 2.4 : 1.2}
          vectorEffect="non-scaling-stroke"
        />
      ) : object.shape === "ellipse" ? (
        <ellipse
          cx={centerX}
          cy={centerY}
          fill={palette.fill}
          rx={centerX}
          ry={centerY}
          stroke={isSelected ? "var(--primary)" : palette.stroke}
          strokeWidth={isSelected ? 2.4 : 1.2}
          vectorEffect="non-scaling-stroke"
        />
      ) : (
        <rect
          fill={palette.fill}
          height={object.height}
          stroke={isSelected ? "var(--primary)" : palette.stroke}
          strokeWidth={isSelected ? 2.4 : 1.2}
          vectorEffect="non-scaling-stroke"
          width={object.width}
        />
      )}

      {object.type !== "wall" && object.type !== "aisle" && object.width > 52 && object.height > 26 ? (
        <text
          fill={palette.label}
          fontFamily="var(--font-sans)"
          fontSize="11"
          fontWeight="600"
          opacity={0.92}
          textAnchor="middle"
          x={centerX}
          y={centerY}
        >
          {object.label || object.name}
        </text>
      ) : null}
    </g>
  );
}

function ViewerNodes({
  connectorTargetsByNodeId,
  nodes,
  onConnectorPress,
  pendingNodeId,
}: {
  connectorTargetsByNodeId: Record<string, ConnectorTargetInfo[]>;
  nodes: ViewerMapNode[];
  onConnectorPress: (node: ViewerMapNode, targets: ConnectorTargetInfo[]) => void;
  pendingNodeId: string | null;
}) {
  return (
    <g>
      {nodes.filter(isNodePublicMarker).map((node) => {
        const palette = getViewerNodePalette(node.role);
        const connectorTargets = connectorTargetsByNodeId[node.id];
        const hasConnectorTargets = Boolean(connectorTargets && connectorTargets.length > 0);
        const isPending = pendingNodeId === node.id;

        return (
          <g
            className="group"
            key={node.id}
            onClick={hasConnectorTargets ? (event) => {
              event.stopPropagation();
              onConnectorPress(node, connectorTargets);
            } : undefined}
            onPointerDown={hasConnectorTargets ? (event) => event.stopPropagation() : undefined}
            transform={`translate(${node.x}, ${node.y})`}
          >
            <circle fill={palette.ring} r="14" />
            <circle
              fill={palette.fill}
              r="5.5"
              stroke="var(--background)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            {hasConnectorTargets && isPending ? (
              <ConnectorJumpHint
                label={connectorTargets.length === 1
                  ? `Tap again for ${connectorTargets[0].floorName}`
                  : "Tap again to choose a floor"}
                x={0}
                y={-14}
              />
            ) : node.label ? (
              // Hidden by default — a floor with a few dozen markers turns
              // into a wall of text otherwise; shown on hover instead.
              <text
                className="pointer-events-none opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                fill="var(--map-viewer-label)"
                fontFamily="var(--font-sans)"
                fontSize="10"
                fontWeight="700"
                textAnchor="middle"
                y="-14"
              >
                {node.label}
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

function ConnectorJumpHint({ label, x, y }: { label: string; x: number; y: number }) {
  const width = Math.max(label.length * 5.6 + 20, 88);

  return (
    <g className="pointer-events-none" transform={`translate(${x}, ${y - 18})`}>
      <rect
        fill="var(--popover)"
        height="22"
        rx="11"
        stroke="var(--border)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        width={width}
        x={-width / 2}
        y="-11"
      />
      <text
        fill="var(--popover-foreground)"
        fontFamily="var(--font-sans)"
        fontSize="10"
        fontWeight="600"
        textAnchor="middle"
        y="3.5"
      >
        {label}
      </text>
    </g>
  );
}

function ViewerEdges({
  edges,
  nodes,
}: {
  edges: ViewerPathEdge[];
  nodes: ViewerMapNode[];
}) {
  const nodesById = Object.fromEntries(nodes.map((node) => [node.id, node]));

  return (
    <g>
      {edges.map((edge) => {
        const fromNode = nodesById[edge.fromNodeId];
        const toNode = nodesById[edge.toNodeId];

        if (!fromNode || !toNode) {
          return null;
        }

        const palette = getViewerEdgePalette(edge.type);

        return (
          <line
            key={edge.id}
            stroke={palette.stroke}
            strokeDasharray={edge.type === "stairs" ? "6 5" : edge.type === "escalator" ? "2 4" : undefined}
            strokeLinecap="round"
            strokeOpacity={0.72}
            strokeWidth={edge.type === "walkway" ? 3 : 3.6}
            vectorEffect="non-scaling-stroke"
            x1={fromNode.x}
            x2={toNode.x}
            y1={fromNode.y}
            y2={toNode.y}
          />
        );
      })}
    </g>
  );
}
