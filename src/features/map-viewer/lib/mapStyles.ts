import type {
  ViewerMapNode,
  ViewerMapObject,
  ViewerPathEdge,
} from "../types/map-viewer.types";

export function getViewerObjectPalette(type: ViewerMapObject["type"]) {
  switch (type) {
    case "wall":
      return {
        fill: "color-mix(in oklch, var(--foreground) 18%, var(--muted) 82%)",
        label: "var(--foreground)",
        stroke: "color-mix(in oklch, var(--foreground) 30%, var(--border) 70%)",
      };
    case "hallway":
      return {
        fill: "color-mix(in oklch, var(--background) 40%, var(--muted) 60%)",
        label: "var(--muted-foreground)",
        stroke: "color-mix(in oklch, var(--border) 72%, var(--foreground) 28%)",
      };
    case "door":
      return {
        fill: "color-mix(in oklch, var(--chart-5) 22%, transparent)",
        label: "var(--foreground)",
        stroke: "var(--chart-5)",
      };
    case "stairs":
      return {
        fill: "color-mix(in oklch, var(--chart-2) 18%, var(--card) 82%)",
        label: "var(--foreground)",
        stroke: "var(--chart-2)",
      };
    case "elevator":
      return {
        fill: "color-mix(in oklch, var(--chart-4) 18%, var(--card) 82%)",
        label: "var(--foreground)",
        stroke: "var(--chart-4)",
      };
    case "washroom":
      return {
        fill: "color-mix(in oklch, var(--chart-1) 18%, var(--card) 82%)",
        label: "var(--foreground)",
        stroke: "var(--chart-1)",
      };
    case "exit":
      return {
        fill: "color-mix(in oklch, var(--destructive) 18%, var(--card) 82%)",
        label: "var(--foreground)",
        stroke: "var(--destructive)",
      };
    case "poi":
      return {
        fill: "color-mix(in oklch, var(--primary) 20%, var(--card) 80%)",
        label: "var(--foreground)",
        stroke: "var(--primary)",
      };
    case "aisle":
      return {
        fill: "color-mix(in oklch, var(--chart-3) 14%, var(--card) 86%)",
        label: "var(--foreground)",
        stroke: "var(--chart-3)",
      };
    case "shelf":
      return {
        fill: "color-mix(in oklch, var(--chart-2) 14%, var(--muted) 86%)",
        label: "var(--foreground)",
        stroke: "color-mix(in oklch, var(--chart-2) 45%, var(--border) 55%)",
      };
    case "section":
      return {
        fill: "color-mix(in oklch, var(--primary) 12%, var(--muted) 88%)",
        label: "var(--foreground)",
        stroke: "color-mix(in oklch, var(--primary) 36%, var(--border) 64%)",
      };
    case "room":
    default:
      return {
        fill: "color-mix(in oklch, var(--card) 88%, var(--primary) 12%)",
        label: "var(--foreground)",
        stroke: "color-mix(in oklch, var(--primary) 28%, var(--border) 72%)",
      };
  }
}

export function getViewerNodePalette(role: ViewerMapNode["role"]) {
  switch (role) {
    case "entrance":
      return {
        fill: "var(--chart-3)",
        ring: "color-mix(in oklch, var(--chart-3) 46%, transparent)",
      };
    case "exit":
      return {
        fill: "var(--destructive)",
        ring: "color-mix(in oklch, var(--destructive) 40%, transparent)",
      };
    case "stairs_entry":
      return {
        fill: "var(--chart-2)",
        ring: "color-mix(in oklch, var(--chart-2) 40%, transparent)",
      };
    case "elevator_entry":
      return {
        fill: "var(--chart-4)",
        ring: "color-mix(in oklch, var(--chart-4) 40%, transparent)",
      };
    case "shelf_access":
      return {
        fill: "var(--chart-1)",
        ring: "color-mix(in oklch, var(--chart-1) 40%, transparent)",
      };
    case "hallway_point":
    default:
      return {
        fill: "var(--muted-foreground)",
        ring: "color-mix(in oklch, var(--muted-foreground) 28%, transparent)",
      };
  }
}

export function getViewerEdgePalette(type: ViewerPathEdge["type"]) {
  switch (type) {
    case "stairs":
      return {
        stroke: "color-mix(in oklch, var(--chart-2) 72%, var(--border) 28%)",
      };
    case "elevator":
      return {
        stroke: "color-mix(in oklch, var(--chart-4) 68%, var(--border) 32%)",
      };
    case "ramp":
      return {
        stroke: "color-mix(in oklch, var(--chart-3) 70%, var(--border) 30%)",
      };
    case "walkway":
    default:
      return {
        stroke: "color-mix(in oklch, var(--muted-foreground) 62%, var(--border) 38%)",
      };
  }
}

export function isNodePublicMarker(node: ViewerMapNode) {
  return node.role !== "hallway_point";
}
