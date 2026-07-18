import type { PointerEventHandler } from "react";

import { MAP_VIEWER_FLOOR_CONTENT_PADDING } from "../constants/mapViewer.constants";
import {
  getViewerEdgePalette,
  getViewerNodePalette,
  getViewerObjectPalette,
  isNodePublicMarker,
} from "../lib/mapStyles";
import { getRenderedFloorSize } from "../lib/mapViewerViewport";
import type {
  ViewerFloor,
  ViewerMapNode,
  ViewerMapObject,
  ViewerPathEdge,
} from "../types/map-viewer.types";

interface MapViewerSvgProps {
  activeFloor: ViewerFloor;
  edges: ViewerPathEdge[];
  nodes: ViewerMapNode[];
  objects: ViewerMapObject[];
  routePoints?: { x: number; y: number }[];
  selectedObjectId: string | null;
  showGrid: boolean;
  onBackgroundClick: () => void;
  onObjectSelect: (object: ViewerMapObject) => void;
  onPointerDown: PointerEventHandler<SVGSVGElement>;
  onPointerMove: PointerEventHandler<SVGSVGElement>;
  onPointerUp: PointerEventHandler<SVGSVGElement>;
}

export function MapViewerSvg({
  activeFloor,
  edges,
  nodes,
  objects,
  routePoints,
  selectedObjectId,
  showGrid,
  onBackgroundClick,
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
        <filter id="viewer-reference-image">
          <feColorMatrix
            type="matrix"
            values="0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 1 0"
          />
        </filter>
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
          height={activeFloor.height}
          opacity={0.07}
          preserveAspectRatio="none"
          width={activeFloor.width}
          x={MAP_VIEWER_FLOOR_CONTENT_PADDING}
          y={MAP_VIEWER_FLOOR_CONTENT_PADDING}
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

      <g
        opacity="0.92"
        transform={`translate(${MAP_VIEWER_FLOOR_CONTENT_PADDING}, ${MAP_VIEWER_FLOOR_CONTENT_PADDING})`}
      >
        <ViewerEdges edges={edges} nodes={nodes} />
        <ViewerObjects
          objects={objects}
          onSelect={onObjectSelect}
          selectedObjectId={selectedObjectId}
        />
        <ViewerNodes nodes={nodes} />
        {routePoints && routePoints.length > 1 ? <RoutePolyline points={routePoints} /> : null}
      </g>
    </svg>
  );
}

function RoutePolyline({ points }: { points: { x: number; y: number }[] }) {
  const origin = points[0];
  const destination = points[points.length - 1];

  return (
    <g>
      <polyline
        fill="none"
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
  objects,
  onSelect,
  selectedObjectId,
}: {
  objects: ViewerMapObject[];
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

        return (
          <g
            key={object.id}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(object);
            }}
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

function ViewerNodes({ nodes }: { nodes: ViewerMapNode[] }) {
  return (
    <g>
      {nodes.filter(isNodePublicMarker).map((node) => {
        const palette = getViewerNodePalette(node.role);

        return (
          <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
            <circle fill={palette.ring} r="14" />
            <circle
              fill={palette.fill}
              r="5.5"
              stroke="var(--background)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            {node.label ? (
              <text
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
            strokeDasharray={edge.type === "stairs" ? "6 5" : undefined}
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
