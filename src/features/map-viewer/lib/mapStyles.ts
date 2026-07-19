import type {
  ViewerMapNode,
  ViewerMapObject,
  ViewerPathEdge,
} from "../types/map-viewer.types";

export function getViewerObjectPalette(type: ViewerMapObject["type"]) {
  switch (type) {
    case "wall":
      return {
        fill: "var(--map-viewer-wall-fill)",
        label: "var(--map-viewer-label)",
        stroke: "var(--map-viewer-wall-stroke)",
      };
    case "hallway":
      return {
        fill: "var(--map-viewer-hallway-fill)",
        label: "var(--map-viewer-label-muted)",
        stroke: "var(--map-viewer-hallway-stroke)",
      };
    case "door":
      return {
        fill: "var(--map-viewer-door-fill)",
        label: "var(--map-viewer-label)",
        stroke: "var(--map-viewer-door-stroke)",
      };
    case "stairs":
      return {
        fill: "var(--map-viewer-stairs-fill)",
        label: "var(--map-viewer-label)",
        stroke: "var(--map-viewer-stairs-stroke)",
      };
    case "elevator":
      return {
        fill: "var(--map-viewer-elevator-fill)",
        label: "var(--map-viewer-label)",
        stroke: "var(--map-viewer-elevator-stroke)",
      };
    case "escalator":
      return {
        fill: "var(--map-viewer-escalator-fill)",
        label: "var(--map-viewer-label)",
        stroke: "var(--map-viewer-escalator-stroke)",
      };
    case "washroom":
      return {
        fill: "var(--map-viewer-washroom-fill)",
        label: "var(--map-viewer-label)",
        stroke: "var(--map-viewer-washroom-stroke)",
      };
    case "exit":
      return {
        fill: "var(--map-viewer-exit-fill)",
        label: "var(--map-viewer-label)",
        stroke: "var(--map-viewer-exit-stroke)",
      };
    case "poi":
      return {
        fill: "var(--map-viewer-poi-fill)",
        label: "var(--map-viewer-label)",
        stroke: "var(--map-viewer-poi-stroke)",
      };
    case "aisle":
      return {
        fill: "var(--map-viewer-aisle-fill)",
        label: "var(--map-viewer-label)",
        stroke: "var(--map-viewer-aisle-stroke)",
      };
    case "shelf":
      return {
        fill: "var(--map-viewer-shelf-fill)",
        label: "var(--map-viewer-label)",
        stroke: "var(--map-viewer-shelf-stroke)",
      };
    case "section":
      return {
        fill: "var(--map-viewer-section-fill)",
        label: "var(--map-viewer-label)",
        stroke: "var(--map-viewer-section-stroke)",
      };
    case "room":
    default:
      return {
        fill: "var(--map-viewer-room-fill)",
        label: "var(--map-viewer-label)",
        stroke: "var(--map-viewer-room-stroke)",
      };
  }
}

export function getViewerNodePalette(role: ViewerMapNode["role"]) {
  switch (role) {
    case "entrance":
      return {
        fill: "var(--map-viewer-marker-entrance)",
        ring: "var(--map-viewer-marker-entrance-ring)",
      };
    case "exit":
      return {
        fill: "var(--map-viewer-marker-exit)",
        ring: "var(--map-viewer-marker-exit-ring)",
      };
    case "stairs_entry":
      return {
        fill: "var(--map-viewer-marker-stairs)",
        ring: "var(--map-viewer-marker-stairs-ring)",
      };
    case "elevator_entry":
      return {
        fill: "var(--map-viewer-marker-elevator)",
        ring: "var(--map-viewer-marker-elevator-ring)",
      };
    case "escalator_entry":
      return {
        fill: "var(--map-viewer-marker-escalator)",
        ring: "var(--map-viewer-marker-escalator-ring)",
      };
    case "shelf_access":
      return {
        fill: "var(--map-viewer-marker-shelf)",
        ring: "var(--map-viewer-marker-shelf-ring)",
      };
    case "hallway_point":
    default:
      return {
        fill: "var(--map-viewer-marker-neutral)",
        ring: "var(--map-viewer-marker-neutral-ring)",
      };
  }
}

export function getViewerEdgePalette(type: ViewerPathEdge["type"]) {
  switch (type) {
    case "stairs":
      return {
        stroke: "var(--map-viewer-path-stairs)",
      };
    case "elevator":
      return {
        stroke: "var(--map-viewer-path-elevator)",
      };
    case "escalator":
      return {
        stroke: "var(--map-viewer-path-escalator)",
      };
    case "ramp":
      return {
        stroke: "var(--map-viewer-path-ramp)",
      };
    case "walkway":
    default:
      return {
        stroke: "var(--map-viewer-path-walkway)",
      };
  }
}

export function isNodePublicMarker(node: ViewerMapNode) {
  return node.role !== "hallway_point";
}
