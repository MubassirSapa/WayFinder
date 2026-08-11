import {
  EDITOR_VIEWPORT_FIT_PADDING,
  EDITOR_VIEWPORT_MAX_ZOOM,
  EDITOR_VIEWPORT_MIN_ZOOM,
  EDITOR_VIEWPORT_PAN_OVERSCROLL,
} from '../constants/canvasViewport.constants';

export interface Point {
  x: number;
  y: number;
}

export interface FloorSize {
  width: number;
  height: number;
}

export function clampEditorZoom(value: number): number {
  return Math.min(Math.max(value, EDITOR_VIEWPORT_MIN_ZOOM), EDITOR_VIEWPORT_MAX_ZOOM);
}

export function getEditorFitZoom(floorSize: FloorSize, viewport: Point): number {
  if (floorSize.width <= 0 || floorSize.height <= 0 || viewport.x <= 0 || viewport.y <= 0) {
    return 1;
  }

  return clampEditorZoom(
    Math.min(
      (viewport.x - EDITOR_VIEWPORT_FIT_PADDING) / floorSize.width,
      (viewport.y - EDITOR_VIEWPORT_FIT_PADDING) / floorSize.height,
    ),
  );
}

// Mirrors the map viewer's clampPanToViewport (src/features/map-viewer/lib/mapViewerViewport.ts):
// a floor smaller than the viewport can't be dragged past a small overscroll
// on either side of center; a floor larger than the viewport can't be
// dragged so far that less than `overscroll` px of it remains reachable.
export function clampEditorPan(
  nextPan: Point,
  floorSize: FloorSize,
  viewport: Point,
  zoom: number,
  overscroll: number = EDITOR_VIEWPORT_PAN_OVERSCROLL,
): Point {
  const scaledWidth = floorSize.width * zoom;
  const scaledHeight = floorSize.height * zoom;

  const x = scaledWidth <= viewport.x
    ? Math.min(viewport.x - scaledWidth + overscroll, Math.max(-overscroll, nextPan.x))
    : Math.min(overscroll, Math.max(viewport.x - scaledWidth - overscroll, nextPan.x));

  const y = scaledHeight <= viewport.y
    ? Math.min(viewport.y - scaledHeight + overscroll, Math.max(-overscroll, nextPan.y))
    : Math.min(overscroll, Math.max(viewport.y - scaledHeight - overscroll, nextPan.y));

  return { x, y };
}

// Centers the floor in the viewport at whatever zoom lets it fully fit.
export function getEditorDefaultView(floorSize: FloorSize, viewport: Point): { pan: Point; zoom: number } {
  const zoom = getEditorFitZoom(floorSize, viewport);
  const pan = {
    x: viewport.x / 2 - (floorSize.width / 2) * zoom,
    y: viewport.y / 2 - (floorSize.height / 2) * zoom,
  };

  return { pan: clampEditorPan(pan, floorSize, viewport, zoom), zoom };
}

// The one formula both the pointer/wheel handlers and MapCanvas's rendered
// style must agree on, same reasoning as the map viewer's
// buildPanZoomTransform (src/features/map-viewer/lib/mapViewerTransform.ts).
export function buildCanvasViewportTransform(pan: Point, zoom: number): string {
  return `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;
}
