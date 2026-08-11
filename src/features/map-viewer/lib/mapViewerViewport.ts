import {
  MAP_VIEWER_DESKTOP_MAX_ZOOM,
  MAP_VIEWER_DESKTOP_MIN_ZOOM,
  MAP_VIEWER_FIT_VIEW_PADDING,
  MAP_VIEWER_FLOOR_CONTENT_PADDING,
  MAP_VIEWER_MOBILE_BREAKPOINT,
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

// floorFitZoom, when passed, is the current floor's own fit-to-view zoom
// (getRawFitZoom) - the profile widens (never narrows) to always include it,
// so a floor much larger or smaller than the fixed desktop/mobile range was
// tuned for can still reach a genuine "fit" view. Without this, an oversized
// floor's fit zoom gets clamped up to the fixed minimum, so "fit" silently
// doesn't fit and the rest of the floor is only reachable by panning - not
// obvious it's even there.
export function getZoomProfile(viewportWidth: number, floorFitZoom?: number) {
  const isMobile = viewportWidth < MAP_VIEWER_MOBILE_BREAKPOINT;
  const baseMaxZoom = isMobile ? MAP_VIEWER_MOBILE_MAX_ZOOM : MAP_VIEWER_DESKTOP_MAX_ZOOM;
  const baseMinZoom = isMobile ? MAP_VIEWER_MOBILE_MIN_ZOOM : MAP_VIEWER_DESKTOP_MIN_ZOOM;

  return {
    maxZoom: floorFitZoom === undefined ? baseMaxZoom : Math.max(baseMaxZoom, floorFitZoom),
    minZoom: floorFitZoom === undefined ? baseMinZoom : Math.min(baseMinZoom, floorFitZoom),
  };
}

export function clampZoom(value: number, viewportWidth: number, floorFitZoom?: number) {
  const zoomProfile = getZoomProfile(viewportWidth, floorFitZoom);
  return Math.min(Math.max(value, zoomProfile.minZoom), zoomProfile.maxZoom);
}

export function getRenderedFloorSize(floor: ViewerFloor) {
  return {
    height: floor.height + MAP_VIEWER_FLOOR_CONTENT_PADDING * 2,
    width: floor.width + MAP_VIEWER_FLOOR_CONTENT_PADDING * 2,
  };
}

// The zoom that exactly fits the floor in the viewport, before the fixed
// desktop/mobile min/max profile is applied - feed this back into
// clampZoom's floorFitZoom parameter so that profile widens to include it.
export function getRawFitZoom(floor: ViewerFloor, viewport: Point) {
  const renderedSize = getRenderedFloorSize(floor);

  return Math.min(
    (viewport.x - MAP_VIEWER_FIT_VIEW_PADDING) / renderedSize.width,
    (viewport.y - MAP_VIEWER_FIT_VIEW_PADDING) / renderedSize.height,
  );
}

export function getFitZoom(floor: ViewerFloor, viewport: Point) {
  const rawFitZoom = getRawFitZoom(floor, viewport);
  return clampZoom(rawFitZoom, viewport.x, rawFitZoom);
}

export function getFitBoundsView(
  bounds: WorldBounds,
  viewport: Point,
  padding: number = MAP_VIEWER_FIT_VIEW_PADDING,
) {
  const boundsWidth = Math.max(bounds.maxX - bounds.minX, 1);
  const boundsHeight = Math.max(bounds.maxY - bounds.minY, 1);

  const rawZoom = Math.min(
    (viewport.x - padding) / boundsWidth,
    (viewport.y - padding) / boundsHeight,
  );
  const zoom = clampZoom(rawZoom, viewport.x, rawZoom);

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

// Starts zoomed out enough to show the whole floor, centered in the
// viewport — getFitZoom is already exactly that zoom level, so no extra
// zoom-in multiplier is applied on top of it.
export function getDefaultViewState(floor: ViewerFloor, viewport: Point) {
  const zoom = getFitZoom(floor, viewport);
  const renderedSize = getRenderedFloorSize(floor);

  return {
    pan: clampPanToViewport(
      {
        x: viewport.x / 2 - (renderedSize.width / 2) * zoom,
        y: viewport.y / 2 - (renderedSize.height / 2) * zoom,
      },
      floor,
      viewport,
      zoom,
      MAP_VIEWER_PAN_OVERSCROLL,
    ),
    zoom,
  };
}

export interface FloorViewResizeOptions {
  currentPan: Point;
  currentZoom: number;
  hasPendingFocus: boolean;
  isFirstMeasurementForFloor: boolean;
}

// Called from useMapViewerViewport's ResizeObserver callback on every
// measurement of the viewport element. Returns null for a measurement that
// should be ignored entirely — most importantly a 0-size read, which happens
// on the very first effect run right after mount/hydration, before layout
// has settled (much more likely on a hard reload than a client navigation).
// Without this guard, that bogus 0x0 measurement would compute (and then
// permanently lock in, since later branches only re-clamp, never recompute)
// a wrong default zoom/pan for the rest of the session.
export function resolveFloorViewOnResize(
  floor: ViewerFloor,
  viewport: Point,
  options: FloorViewResizeOptions,
): { pan: Point; zoom: number } | null {
  if (viewport.x <= 0 || viewport.y <= 0) {
    return null;
  }

  if (options.isFirstMeasurementForFloor && !options.hasPendingFocus) {
    return getDefaultViewState(floor, viewport);
  }

  // Either a plain resize of an already-initialized floor, or the first real
  // measurement right after a focusWorldBounds call (floor-hop / connector
  // jump) already set an explicit pan/zoom — keep it, just re-clamp to the
  // new viewport bounds instead of overriding it with the floor's default.
  return {
    pan: clampPanToViewport(options.currentPan, floor, viewport, options.currentZoom),
    zoom: options.currentZoom,
  };
}
