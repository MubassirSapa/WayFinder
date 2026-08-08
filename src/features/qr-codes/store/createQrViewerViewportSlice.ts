import type { StateCreator } from "zustand";

import type { Point } from "@/features/map-viewer/lib/mapViewerViewport";
import type { AppStore } from "@/store/types";

// Own field names, not a reuse of MapViewerViewportSlice's viewportPan/
// viewportZoom/isViewportDragging - the dashboard QR viewer needs pan/zoom/
// drag state completely isolated from the public map viewer's, so an admin
// browsing rooms here can never bleed into (or be bled into by) a real
// navigation session in the same browser tab. See
// docs/technical/DASHBOARD_QR_VIEWER.md.
export interface QrViewerViewportSlice {
  isQrViewerDragging: boolean;
  qrViewerPan: Point;
  qrViewerZoom: number;
  setIsQrViewerDragging: (isDragging: boolean) => void;
  setQrViewerPan: (pan: Point) => void;
  setQrViewerView: (view: { pan: Point; zoom: number }) => void;
  setQrViewerZoom: (zoom: number) => void;
}

export const createQrViewerViewportSlice: StateCreator<AppStore, [], [], QrViewerViewportSlice> = (set) => ({
  isQrViewerDragging: false,
  qrViewerPan: { x: 0, y: 0 },
  qrViewerZoom: 1,
  setIsQrViewerDragging: (isDragging) => set({ isQrViewerDragging: isDragging }),
  setQrViewerPan: (pan) => set({ qrViewerPan: pan }),
  setQrViewerView: (view) => set({ qrViewerPan: view.pan, qrViewerZoom: view.zoom }),
  setQrViewerZoom: (zoom) => set({ qrViewerZoom: zoom }),
});
