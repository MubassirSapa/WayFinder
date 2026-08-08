import { useAppStore } from "@/store";

import type { Point } from "../lib/mapViewerViewport";

// The seam that lets useMapViewerViewport/useMapViewerViewportGestures be
// reused against a different slice of state than the public viewer's own
// viewportPan/viewportZoom/isViewportDragging - e.g. the dashboard QR
// viewer's isolated qrViewer* fields (see
// src/features/qr-codes/store/qrViewerViewportBinding.ts). Every store
// touch in both hooks is imperative (getState/actions, never a reactive
// selector - see useMapViewerViewport.ts's top comment), so this only ever
// needs to be a plain getter/setter bundle, not a set of hooks.
export interface MapViewerViewportBinding {
  getViewportView: () => { pan: Point; zoom: number };
  setIsViewportDragging: (isDragging: boolean) => void;
  setViewportView: (view: { pan: Point; zoom: number }) => void;
}

export const defaultMapViewerViewportBinding: MapViewerViewportBinding = {
  getViewportView: () => {
    const { viewportPan, viewportZoom } = useAppStore.getState();
    return { pan: viewportPan, zoom: viewportZoom };
  },
  setIsViewportDragging: (isDragging) => useAppStore.getState().setIsViewportDragging(isDragging),
  setViewportView: (view) => useAppStore.getState().setViewportView(view),
};
