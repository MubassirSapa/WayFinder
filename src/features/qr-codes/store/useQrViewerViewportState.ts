import type { ViewportState } from "@/features/map-viewer/store/useMapViewerViewportState";
import { useAppStore } from "@/store";

// Reactive counterpart to qrViewerViewportBinding.ts - passed to
// MapViewerCanvas's useViewportState prop so only this page's canvas
// subscribes to the isolated qrViewer* slice, not the public viewer's.
export function useQrViewerViewportState(): ViewportState {
  const pan = useAppStore((state) => state.qrViewerPan);
  const zoom = useAppStore((state) => state.qrViewerZoom);
  const isDragging = useAppStore((state) => state.isQrViewerDragging);
  return { isDragging, pan, zoom };
}
