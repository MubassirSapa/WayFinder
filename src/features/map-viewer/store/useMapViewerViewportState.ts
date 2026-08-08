import { useAppStore } from "@/store";

import type { Point } from "../lib/mapViewerViewport";

export interface ViewportState {
  isDragging: boolean;
  pan: Point;
  zoom: number;
}

// The *reactive* counterpart to mapViewerViewportBinding.ts's imperative
// getter/setter bundle. MapViewerCanvas takes this as an injectable hook
// (not resolved pan/zoom/isDragging values) so the subscription itself stays
// scoped to whichever component actually renders the canvas - lifting the
// values up to MapViewerShell first would subscribe the whole shell to every
// pan/zoom tick during a drag/pinch gesture, which is exactly what the
// original design avoided (see useMapViewerViewport.ts's top comment). The
// dashboard QR viewer passes its own hook reading the isolated qrViewer*
// slice instead of this default.
export function useDefaultMapViewerViewportState(): ViewportState {
  const pan = useAppStore((state) => state.viewportPan);
  const zoom = useAppStore((state) => state.viewportZoom);
  const isDragging = useAppStore((state) => state.isViewportDragging);
  return { isDragging, pan, zoom };
}
