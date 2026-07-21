import type { PointerEventHandler } from "react";

import { MAP_VIEWER_FLOOR_CONTENT_PADDING } from "../constants/mapViewer.constants";
import { useConnectorDoublePress } from "../hooks/useConnectorDoublePress";
import { BACKGROUND_IMAGE_CLIP_PATH_ID, computeBackgroundImageFit } from "../lib/backgroundImageFit";
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
  connectorTargetsByNodeId: Record<string, ConnectorTargetInfo>;
  edges: ViewerPathEdge[];
  nodes: ViewerMapNode[];
  objects: ViewerMapObject[];
  routePoints?: { x: number; y: number }[];
  selectedObjectId: string | null;
  showGrid: boolean;
  onBackgroundClick: () => void;
  onConnectorActivate: (target: ConnectorTargetInfo) => void;
  onObjectSelect: (object: ViewerMapObject) => void;
  onPointerDown: PointerEventHandler<SVGSVGElement>;
  onPointerMove: PointerEventHandler<SVGSVGElement>;
  onPointerUp: PointerEventHandler<SVGSVGElement>;
}

export function MapViewerSvg({
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
  onObjectSelect,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: MapViewerSvgProps) {
  const renderedSize = getRenderedFloorSize(activeFloor);
  const backgroundImageFit = computeBackgroundImageFit({
    floorWidth: activeFloor.width,
    floorHeight: activeFloor.height,
    naturalWidth: activeFloor.backgroundImageNaturalWidth,
    naturalHeight: activeFloor.backgroundImageNaturalHeight,
    fit: activeFloor.backgroundImageFit ?? "fill",
    offsetX: activeFloor.backgroundImageOffsetX,
    offsetY: activeFloor.backgroundImageOffsetY,
  });
  const backgroundImageX = MAP_VIEWER_FLOOR_CONTENT_PADDING + backgroundImageFit.x;
  const backgroundImageY = MAP_VIEWER_FLOOR_CONTENT_PADDING + backgroundImageFit.y;
  const backgroundImageCenterX = backgroundImageX + backgroundImageFit.width / 2;
  const backgroundImageCenterY = backgroundImageY + backgroundImageFit.height / 2;
  const backgroundImageTransform = `translate(${backgroundImageCenterX} ${backgroundImageCenterY}) rotate(${activeFloor.backgroundImageRotation ?? 0}) scale(${activeFloor.backgroundImageScale ?? 1}) translate(${-backgroundImageCenterX} ${-backgroundImageCenterY})`;

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
        <filter id="viewer-reference-image">
          <feColorMatrix
            type="matrix"
            values="0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 1 0"
          />
        </filter>
        <clipPath id={BACKGROUND_IMAGE_CLIP_PATH_ID}>
          <rect
            height={activeFloor.height}
            width={activeFloor.width}
            x={MAP_VIEWER_FLOOR_CONTENT_PADDING}
            y={MAP_VIEWER_FLOOR_CONTENT_PADDING}
          />
        </clipPath>
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

      {activeFloor.backgroundImageUrl ? (
        <image
          filter="url(#viewer-reference-image)"
          href={activeFloor.backgroundImageUrl}
          height={backgroundImageFit.height}
          opacity={0.07}
          preserveAspectRatio="none"
          width={backgroundImageFit.width}
          x={backgroundImageX}
          y={backgroundImageY}
          clipPath={backgroundImageFit.needsClip ? `url(#${BACKGROUND_IMAGE_CLIP_PATH_ID})` : undefined}
          transform={backgroundImageTransform}
        />
      ) : null}

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
        onObjectSelect={onObjectSelect}
        routePoints={routePoints}
        selectedObjectId={selectedObjectId}
      />
    </svg>
  );
}

function ViewerFloorContent({
  connectorTargetsByNodeId,
  edges,
  nodes,
  objects,
  onConnectorActivate,
  onObjectSelect,
  routePoints,
  selectedObjectId,
}: {
  connectorTargetsByNodeId: Record<string, ConnectorTargetInfo>;
  edges: ViewerPathEdge[];
  nodes: ViewerMapNode[];
  objects: ViewerMapObject[];
  onConnectorActivate: (target: ConnectorTargetInfo) => void;
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
  onSelect,
  selectedObjectId,
}: {
  connectorTargetsByNodeId: Record<string, ConnectorTargetInfo>;
  nodes: ViewerMapNode[];
  objects: ViewerMapObject[];
  onConnectorPress: (node: ViewerMapNode, target: ConnectorTargetInfo) => void;
  onSelect: (object: ViewerMapObject) => void;
  selectedObjectId: string | null;
}) {
  return (
    <g>
      {objects.map((object) => {
        const palette = getViewerObjectPalette(object.type);
        const isSelected = selectedObjectId === object.id;
        const centerX = object.width / 2;
        const centerY = object.height / 2;
        const radius = object.type === "room" || object.type === "section" ? 14 : 8;

        // Stairs/elevator/escalator objects are a much bigger, easier target
        // than their connector node marker — clicking anywhere on the shape
        // triggers the same double-press-to-jump instead of only working on
        // the small dot. The hint pill itself is left to the node marker
        // (rendered right at the connector point) so the two don't stack.
        const connectorNode = nodes.find((node) => node.objectId === object.id);
        const connectorTarget = connectorNode ? connectorTargetsByNodeId[connectorNode.id] : undefined;

        return (
          <g
            key={object.id}
            onClick={(event) => {
              event.stopPropagation();
              if (connectorNode && connectorTarget) {
                onConnectorPress(connectorNode, connectorTarget);
              } else {
                onSelect(object);
              }
            }}
            // Without this, a press on an object also reaches the SVG's own
            // pointerdown handler and starts a pan-drag gesture. Any tiny
            // amount of pointer movement between down and up (extremely
            // common on a trackpad) then crosses the drag threshold and the
            // click gets silently suppressed as "that was a pan, not a
            // click" — objects became effectively unclickable.
            onPointerDown={(event) => event.stopPropagation()}
            transform={`translate(${object.x}, ${object.y}) rotate(${object.rotation}, ${centerX}, ${centerY})`}
          >
            <rect
              fill={palette.fill}
              height={object.height}
              rx={radius}
              stroke={isSelected ? "var(--primary)" : palette.stroke}
              strokeWidth={isSelected ? 2.4 : 1.2}
              vectorEffect="non-scaling-stroke"
              width={object.width}
            />

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
      })}
    </g>
  );
}

function ViewerNodes({
  connectorTargetsByNodeId,
  nodes,
  onConnectorPress,
  pendingNodeId,
}: {
  connectorTargetsByNodeId: Record<string, ConnectorTargetInfo>;
  nodes: ViewerMapNode[];
  onConnectorPress: (node: ViewerMapNode, target: ConnectorTargetInfo) => void;
  pendingNodeId: string | null;
}) {
  return (
    <g>
      {nodes.filter(isNodePublicMarker).map((node) => {
        const palette = getViewerNodePalette(node.role);
        const connectorTarget = connectorTargetsByNodeId[node.id];
        const isPending = pendingNodeId === node.id;

        return (
          <g
            className="group"
            key={node.id}
            onClick={connectorTarget ? (event) => {
              event.stopPropagation();
              onConnectorPress(node, connectorTarget);
            } : undefined}
            onPointerDown={connectorTarget ? (event) => event.stopPropagation() : undefined}
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
            {connectorTarget && isPending ? (
              <ConnectorJumpHint floorName={connectorTarget.floorName} x={0} y={-14} />
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

function ConnectorJumpHint({ floorName, x, y }: { floorName: string; x: number; y: number }) {
  const label = `Tap again for ${floorName}`;
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
