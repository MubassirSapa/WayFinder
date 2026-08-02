import type { Point } from "./mapViewerViewport";

// The one formula both the React-rendered style and the imperative
// ref-driven fast path (see useMapViewerViewportGestures.ts) must agree on —
// keeping it in one place means a mid-gesture handoff between the two never
// produces a visible jump.
export function buildPanZoomTransform(pan: Point, zoom: number) {
  return `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;
}
