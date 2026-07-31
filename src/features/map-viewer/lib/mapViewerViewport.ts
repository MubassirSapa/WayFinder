import {
  MAP_VIEWER_DESKTOP_INITIAL_ZOOM_MULTIPLIER,
  MAP_VIEWER_DESKTOP_MAX_ZOOM,
  MAP_VIEWER_DESKTOP_MIN_ZOOM,
  MAP_VIEWER_DEFAULT_OFFSET_X,
  MAP_VIEWER_DEFAULT_OFFSET_Y,
  MAP_VIEWER_FIT_VIEW_PADDING,
  MAP_VIEWER_FLOOR_CONTENT_PADDING,
  MAP_VIEWER_MOBILE_BREAKPOINT,
  MAP_VIEWER_MOBILE_INITIAL_ZOOM_MULTIPLIER,
  MAP_VIEWER_MOBILE_MAX_ZOOM,
  MAP_VIEWER_MOBILE_MIN_ZOOM,
  MAP_VIEWER_PAN_OVERSCROLL,
} from "../constants/mapViewer.constants";
import type { ViewerFloor } from "../types/map-viewer.types";

export interface Point {
  x: number;
  y: number;
}

export interface WorldBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export function formatOrganizationName(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatFloorLabel(floor: ViewerFloor) {
  return `Floor ${floor.level >= 0 ? floor.level : `B${Math.abs(floor.level)}`}`;
}

export function formatObjectTypeLabel(type: string) {
  return type === "poi" ? "POI" : type.charAt(0).toUpperCase() + type.slice(1);
}

export function getZoomProfile(viewportWidth: number) {
  const isMobile = viewportWidth < MAP_VIEWER_MOBILE_BREAKPOINT;

  return {
    initialZoomMultiplier: isMobile
      ? MAP_VIEWER_MOBILE_INITIAL_ZOOM_MULTIPLIER
      : MAP_VIEWER_DESKTOP_INITIAL_ZOOM_MULTIPLIER,
    maxZoom: isMobile ? MAP_VIEWER_MOBILE_MAX_ZOOM : MAP_VIEWER_DESKTOP_MAX_ZOOM,
    minZoom: isMobile ? MAP_VIEWER_MOBILE_MIN_ZOOM : MAP_VIEWER_DESKTOP_MIN_ZOOM,
  };
}

export function clampZoom(value: number, viewportWidth: number) {
  const zoomProfile = getZoomProfile(viewportWidth);
  return Math.min(Math.max(value, zoomProfile.minZoom), zoomProfile.maxZoom);
}

export function getRenderedFloorSize(floor: ViewerFloor) {
  return {
    height: floor.height + MAP_VIEWER_FLOOR_CONTENT_PADDING * 2,
    width: floor.width + MAP_VIEWER_FLOOR_CONTENT_PADDING * 2,
  };
}

export function getFitZoom(floor: ViewerFloor, viewport: Point) {
  const renderedSize = getRenderedFloorSize(floor);

  return clampZoom(
    Math.min(
      (viewport.x - MAP_VIEWER_FIT_VIEW_PADDING) / renderedSize.width,
      (viewport.y - MAP_VIEWER_FIT_VIEW_PADDING) / renderedSize.height,
    ),
    viewport.x,
  );
}

export function getFitBoundsView(
  bounds: WorldBounds,
  viewport: Point,
  padding: number = MAP_VIEWER_FIT_VIEW_PADDING,
) {
  const boundsWidth = Math.max(bounds.maxX - bounds.minX, 1);
  const boundsHeight = Math.max(bounds.maxY - bounds.minY, 1);

  const zoom = clampZoom(
    Math.min(
      (viewport.x - padding) / boundsWidth,
      (viewport.y - padding) / boundsHeight,
    ),
    viewport.x,
  );

  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;

  return {
    pan: {
      x: viewport.x / 2 - centerX * zoom,
      y: viewport.y / 2 - centerY * zoom,
    },
    zoom,
  };
}

export function clampPanToViewport(
  nextPan: Point,
  floor: ViewerFloor,
  viewport: Point,
  nextZoom: number,
  overscroll = MAP_VIEWER_PAN_OVERSCROLL,
) {
  const renderedSize = getRenderedFloorSize(floor);
  const scaledWidth = renderedSize.width * nextZoom;
  const scaledHeight = renderedSize.height * nextZoom;

  const x = scaledWidth <= viewport.x
    ? Math.min(
      viewport.x - scaledWidth + overscroll,
      Math.max(-overscroll, nextPan.x),
    )
    : Math.min(
      overscroll,
      Math.max(viewport.x - scaledWidth - overscroll, nextPan.x),
    );

  const y = scaledHeight <= viewport.y
    ? Math.min(
      viewport.y - scaledHeight + overscroll,
      Math.max(-overscroll, nextPan.y),
    )
    : Math.min(
      overscroll,
      Math.max(viewport.y - scaledHeight - overscroll, nextPan.y),
    );

  return { x, y };
}

export function getDistance(from: Point, to: Point) {
  return Math.hypot(to.x - from.x, to.y - from.y);
}

export function getMidpoint(from: Point, to: Point): Point {
  return {
    x: (from.x + to.x) / 2,
    y: (from.y + to.y) / 2,
  };
}

export function getDefaultViewState(floor: ViewerFloor, viewport: Point) {
  const zoomProfile = getZoomProfile(viewport.x);
  const zoom = clampZoom(
    getFitZoom(floor, viewport) * zoomProfile.initialZoomMultiplier,
    viewport.x,
  );

  return {
    pan: clampPanToViewport(
      {
        x: MAP_VIEWER_DEFAULT_OFFSET_X,
        y: MAP_VIEWER_DEFAULT_OFFSET_Y,
      },
      floor,
      viewport,
      zoom,
      MAP_VIEWER_PAN_OVERSCROLL,
    ),
    zoom,
  };
}
