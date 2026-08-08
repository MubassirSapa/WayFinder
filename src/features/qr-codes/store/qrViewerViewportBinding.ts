import type { MapViewerViewportBinding } from "@/features/map-viewer/store/mapViewerViewportBinding";
import { useAppStore } from "@/store";

// Satisfies map-viewer's MapViewerViewportBinding shape, wired to the
// isolated QrViewerViewportSlice instead of the public viewer's slice - so
// useMapViewerViewport/useMapViewerViewportGestures (imported as-is from
// map-viewer) drive this page's pan/zoom/drag interaction identically to
// the public /map viewer, without touching the same state.
export const qrViewerViewportBinding: MapViewerViewportBinding = {
  getViewportView: () => {
    const { qrViewerPan, qrViewerZoom } = useAppStore.getState();
    return { pan: qrViewerPan, zoom: qrViewerZoom };
  },
  setIsViewportDragging: (isDragging) => useAppStore.getState().setIsQrViewerDragging(isDragging),
  setViewportView: (view) => useAppStore.getState().setQrViewerView(view),
};
