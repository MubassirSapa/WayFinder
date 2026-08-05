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
  ConnectorDirection,
  ConnectorTargetInfo,
  ViewerFloor,
  ViewerMapNode,
  ViewerMapObject,
  ViewerPathEdge,
} from "../types/map-viewer.types";

// Shared by the always-visible marker badge and the double-press hint, so
// both draw the exact same up/down triangle rather than two similar-but-
// slightly-different shapes.
const CONNECTOR_UP_TRIANGLE_PATH = "M0,-3.5 L2.8,1.5 L-2.8,1.5 Z";
const CONNECTOR_DOWN_TRIANGLE_PATH = "M0,3.5 L2.8,-1.5 L-2.8,-1.5 Z";

interface MapViewerSvgProps {
  activeFloor: ViewerFloor;
  connectorTargetsByNodeId: Record<string, ConnectorTargetInfo[]>;
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
  onBackgroundClick: () => void;
  onConnectorActivate: (node: ViewerMapNode, targets: ConnectorTargetInfo[]) => void;
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
  onBackgroundClick,
  onConnectorActivate,
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
        destinationObjectId={destinationObjectId}
        edges={edges}
        nodes={nodes}
        objects={objects}
        onConnectorActivate={onConnectorActivate}
        onObjectSelect={onObjectSelect}
        onViewportPointerDown={onPointerDown}
        onViewportPointerMove={onPointerMove}
        onViewportPointerUp={onPointerUp}
        originObjectId={originObjectId}
        routeConnectorDirection={routeConnectorDirection}
        routeConnectorNodeId={routeConnectorNodeId}
        routeHasDestination={routeHasDestination}
        routeHasStart={routeHasStart}
        routePoints={routePoints}
        selectedObjectId={selectedObjectId}
      />
    </svg>
  );
});

function ViewerFloorContent({
  connectorTargetsByNodeId,
  destinationObjectId,
  edges,
  nodes,
  objects,
  onConnectorActivate,
  onObjectSelect,
  onViewportPointerDown,
  onViewportPointerMove,
  onViewportPointerUp,
  originObjectId,
  routeConnectorDirection,
  routeConnectorNodeId,
  routeHasDestination,
  routeHasStart,
  routePoints,
  selectedObjectId,
}: {
  connectorTargetsByNodeId: Record<string, ConnectorTargetInfo[]>;
  destinationObjectId: string | null;
  edges: ViewerPathEdge[];
  nodes: ViewerMapNode[];
  objects: ViewerMapObject[];
  onConnectorActivate: (node: ViewerMapNode, targets: ConnectorTargetInfo[]) => void;
  onObjectSelect: (object: ViewerMapObject) => void;
  onViewportPointerDown: PointerEventHandler<SVGSVGElement>;
  onViewportPointerMove: PointerEventHandler<SVGSVGElement>;
  onViewportPointerUp: PointerEventHandler<SVGSVGElement>;
  originObjectId: string | null;
  routeConnectorDirection: ConnectorDirection | null;
  routeConnectorNodeId: string | null;
  routeHasDestination?: boolean;
  routeHasStart?: boolean;
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
        destinationObjectId={destinationObjectId}
        nodes={nodes}
        objects={objects}
        onConnectorPress={handlePress}
        onSelect={onObjectSelect}
        onViewportPointerDown={onViewportPointerDown}
        onViewportPointerMove={onViewportPointerMove}
        onViewportPointerUp={onViewportPointerUp}
        originObjectId={originObjectId}
        routeConnectorNodeId={routeConnectorNodeId}
        selectedObjectId={selectedObjectId}
      />
      <ViewerNodes
        connectorTargetsByNodeId={connectorTargetsByNodeId}
        nodes={nodes}
        onConnectorPress={handlePress}
        pendingNodeId={pendingNodeId}
        routeConnectorDirection={routeConnectorDirection}
        routeConnectorNodeId={routeConnectorNodeId}
      />
      {routePoints && routePoints.length > 1 ? (
        <RoutePolyline
          hasDestination={Boolean(routeHasDestination)}
          hasStart={Boolean(routeHasStart)}
          points={routePoints}
        />
      ) : null}
    </g>
  );
}

function RouteEndpointMarker({
  label,
  point,
  token,
}: {
  label: "Destination" | "Start";
  point: { x: number; y: number };
  token: "var(--map-viewer-route-destination)" | "var(--map-viewer-route-origin)";
}) {
  const labelWidth = label === "Destination" ? 76 : 42;

  return (
    <g aria-label={`Route ${label.toLowerCase()}`} role="img">
      <circle cx={point.x} cy={point.y} fill={token} r="7" stroke="var(--background)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <g transform={`translate(${point.x + 10} ${point.y - 13})`}>
        <rect fill="var(--card)" height="20" rx="10" stroke={token} width={labelWidth} x="0" y="0" vectorEffect="non-scaling-stroke" />
        <text fill="var(--foreground)" fontSize="9" fontWeight="700" textAnchor="middle" x={labelWidth / 2} y="13">
          {label}
        </text>
      </g>
    </g>
  );
}

function RoutePolyline({
  hasDestination,
  hasStart,
  points,
}: {
  hasDestination: boolean;
  hasStart: boolean;
  points: { x: number; y: number }[];
}) {
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
      {hasStart ? <RouteEndpointMarker label="Start" point={origin} token="var(--map-viewer-route-origin)" /> : null}
      {hasDestination ? <RouteEndpointMarker label="Destination" point={destination} token="var(--map-viewer-route-destination)" /> : null}
    </g>
  );
}

function ViewerObjects({
  connectorTargetsByNodeId,
  destinationObjectId,
  nodes,
  objects,
  onConnectorPress,
  onSelect,
  onViewportPointerDown,
  onViewportPointerMove,
  onViewportPointerUp,
  originObjectId,
  routeConnectorNodeId,
  selectedObjectId,
}: {
  connectorTargetsByNodeId: Record<string, ConnectorTargetInfo[]>;
  destinationObjectId: string | null;
  nodes: ViewerMapNode[];
  objects: ViewerMapObject[];
  onConnectorPress: (node: ViewerMapNode, targets: ConnectorTargetInfo[]) => void;
  onSelect: (object: ViewerMapObject) => void;
  onViewportPointerDown: PointerEventHandler<SVGSVGElement>;
  onViewportPointerMove: PointerEventHandler<SVGSVGElement>;
  onViewportPointerUp: PointerEventHandler<SVGSVGElement>;
  originObjectId: string | null;
  routeConnectorNodeId: string | null;
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
            isDestination={destinationObjectId === object.id}
            isOnRoute={connectorNode?.id === routeConnectorNodeId}
            isOrigin={originObjectId === object.id}
            isSelected={selectedObjectId === object.id}
            key={object.id}
            object={object}
            onConnectorPress={onConnectorPress}
            onSelect={onSelect}
            onViewportPointerDown={onViewportPointerDown}
            onViewportPointerMove={onViewportPointerMove}
            onViewportPointerUp={onViewportPointerUp}
          />
        );
      })}
    </g>
  );
}

function ViewerObjectItem({
  connectorNode,
  connectorTargets,
  isDestination,
  isOnRoute,
  isOrigin,
  isSelected,
  object,
  onConnectorPress,
  onSelect,
  onViewportPointerDown,
  onViewportPointerMove,
  onViewportPointerUp,
}: {
  connectorNode: ViewerMapNode | undefined;
  connectorTargets: ConnectorTargetInfo[] | undefined;
  isDestination: boolean;
  isOnRoute: boolean;
  isOrigin: boolean;
  isSelected: boolean;
  object: ViewerMapObject;
  onConnectorPress: (node: ViewerMapNode, targets: ConnectorTargetInfo[]) => void;
  onSelect: (object: ViewerMapObject) => void;
  onViewportPointerDown: PointerEventHandler<SVGSVGElement>;
  onViewportPointerMove: PointerEventHandler<SVGSVGElement>;
  onViewportPointerUp: PointerEventHandler<SVGSVGElement>;
}) {
  const palette = getViewerObjectPalette(object.type);
  const centerX = object.width / 2;
  const centerY = object.height / 2;
  // Selection (an explicit click) always wins visually over every other
  // state. Below that, being the route's origin/destination is more
  // specific than "this is merely the connector the route currently uses on
  // this floor", so it takes precedence over isOnRoute. An object can only
  // be shown as one or the other if it's somehow both (picking the same spot
  // for start and destination) — destination wins in that rare case.
  const outlineColor = isSelected
    ? "var(--primary)"
    : isDestination
      ? "var(--map-viewer-route-destination)"
      : isOrigin
        ? "var(--map-viewer-route-origin)"
        : isOnRoute
          ? "var(--map-viewer-route-line)"
          : palette.stroke;
  const outlineWidth = isSelected || isOnRoute || isOrigin || isDestination ? 2.4 : 1.2;

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
  const activePointerIdsRef = useRef<Set<number>>(new Set());
  const hasDraggedRef = useRef(false);

  const handlePointerDown = (event: PointerEvent<SVGGElement>) => {
    event.stopPropagation();
    if (activePointerIdsRef.current.size === 0) {
      dragStartRef.current = { x: event.clientX, y: event.clientY };
      hasDraggedRef.current = false;
    }
    activePointerIdsRef.current.add(event.pointerId);
    if (activePointerIdsRef.current.size > 1) {
      hasDraggedRef.current = true;
    }
    onViewportPointerDown(event as unknown as PointerEvent<SVGSVGElement>);
  };

  const handlePointerMove = (event: PointerEvent<SVGGElement>) => {
    event.stopPropagation();
    const start = dragStartRef.current;

    if (start && !hasDraggedRef.current) {
      const distance = Math.hypot(event.clientX - start.x, event.clientY - start.y);
      if (distance > MAP_VIEWER_DRAG_THRESHOLD) {
        hasDraggedRef.current = true;
      }
    }

    onViewportPointerMove(event as unknown as PointerEvent<SVGSVGElement>);
  };

  const handlePointerEnd = (event: PointerEvent<SVGGElement>) => {
    event.stopPropagation();
    onViewportPointerUp(event as unknown as PointerEvent<SVGSVGElement>);
    activePointerIdsRef.current.delete(event.pointerId);
    if (activePointerIdsRef.current.size === 0) {
      dragStartRef.current = null;
    }
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
          stroke={outlineColor}
          strokeWidth={outlineWidth}
          vectorEffect="non-scaling-stroke"
        />
      ) : object.shape === "ellipse" ? (
        <ellipse
          cx={centerX}
          cy={centerY}
          fill={palette.fill}
          rx={centerX}
          ry={centerY}
          stroke={outlineColor}
          strokeWidth={outlineWidth}
          vectorEffect="non-scaling-stroke"
        />
      ) : (
        <rect
          fill={palette.fill}
          height={object.height}
          stroke={outlineColor}
          strokeWidth={outlineWidth}
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

// "both" when a connector's targets go both up and down (e.g. an elevator
// serving several floors above and below) — the badge draws both arrows.
// Falls back to the route's own direction for the connector currently
// highlighted as part of an active route, since that's more precise than
// "everywhere this connector could go" in that context.
function summarizeConnectorDirection(targets: ConnectorTargetInfo[]): ConnectorDirection | "both" {
  const hasUp = targets.some((target) => target.direction === "up");
  const hasDown = targets.some((target) => target.direction === "down");
  if (hasUp && hasDown) {
    return "both";
  }
  return hasUp ? "up" : "down";
}

function ViewerNodes({
  connectorTargetsByNodeId,
  nodes,
  onConnectorPress,
  pendingNodeId,
  routeConnectorDirection,
  routeConnectorNodeId,
}: {
  connectorTargetsByNodeId: Record<string, ConnectorTargetInfo[]>;
  nodes: ViewerMapNode[];
  onConnectorPress: (node: ViewerMapNode, targets: ConnectorTargetInfo[]) => void;
  pendingNodeId: string | null;
  routeConnectorDirection: ConnectorDirection | null;
  routeConnectorNodeId: string | null;
}) {
  return (
    <g>
      {nodes.filter(isNodePublicMarker).map((node) => {
        const palette = getViewerNodePalette(node.role);
        const connectorTargets = connectorTargetsByNodeId[node.id];
        const hasConnectorTargets = Boolean(connectorTargets && connectorTargets.length > 0);
        const isPending = pendingNodeId === node.id;
        const isRouteConnector = node.id === routeConnectorNodeId;
        const badgeDirection = isRouteConnector && routeConnectorDirection
          ? routeConnectorDirection
          : connectorTargets
            ? summarizeConnectorDirection(connectorTargets)
            : null;

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
            {isRouteConnector ? (
              // Radar-ping beacon — the map's own answer to "which connector
              // do I use", so it doesn't rely on the user reading the
              // FloorHopIndicator text or tracing the route line to its end.
              <circle
                className="pointer-events-none animate-[wf-pulse_1.6s_ease-out_infinite]"
                fill="var(--map-viewer-route-line)"
                r="14"
              />
            ) : null}
            <circle fill={palette.ring} r="14" />
            <circle
              fill={palette.fill}
              r="5.5"
              stroke={isRouteConnector ? "var(--map-viewer-route-line)" : "var(--background)"}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            {badgeDirection ? (
              <ConnectorDirectionBadge direction={badgeDirection} x={10} y={-10} />
            ) : null}
            {hasConnectorTargets && isPending ? (
              <ConnectorJumpHint
                direction={connectorTargets.length === 1 ? connectorTargets[0].direction : null}
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

function ConnectorJumpHint({
  direction,
  label,
  x,
  y,
}: {
  direction: ConnectorDirection | null;
  label: string;
  x: number;
  y: number;
}) {
  const width = Math.max(label.length * 5.6 + 20 + (direction ? 14 : 0), 88);
  const textX = direction ? 7 : 0;

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
      {direction ? (
        <path
          d={direction === "up" ? CONNECTOR_UP_TRIANGLE_PATH : CONNECTOR_DOWN_TRIANGLE_PATH}
          fill="var(--popover-foreground)"
          transform={`translate(${-width / 2 + 14}, 0)`}
        />
      ) : null}
      <text
        fill="var(--popover-foreground)"
        fontFamily="var(--font-sans)"
        fontSize="10"
        fontWeight="600"
        textAnchor="middle"
        x={textX}
        y="3.5"
      >
        {label}
      </text>
    </g>
  );
}

// Small always-visible badge on every connector marker showing whether it
// leads up, down, or both — so a stairwell/elevator's direction is obvious
// before pressing it, not just during/after the double-press gesture.
function ConnectorDirectionBadge({
  direction,
  x,
  y,
}: {
  direction: ConnectorDirection | "both";
  x: number;
  y: number;
}) {
  return (
    <g className="pointer-events-none" transform={`translate(${x}, ${y})`}>
      <circle
        fill="var(--popover)"
        r="7"
        stroke="var(--border)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
      {direction !== "down" ? (
        <path
          d={CONNECTOR_UP_TRIANGLE_PATH}
          fill="var(--popover-foreground)"
          transform={direction === "both" ? "translate(0, -2)" : undefined}
        />
      ) : null}
      {direction !== "up" ? (
        <path
          d={CONNECTOR_DOWN_TRIANGLE_PATH}
          fill="var(--popover-foreground)"
          transform={direction === "both" ? "translate(0, 2)" : undefined}
        />
      ) : null}
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
