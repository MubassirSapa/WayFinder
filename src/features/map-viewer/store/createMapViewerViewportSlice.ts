import type { StateCreator } from "zustand";

import type { AppStore } from "@/store/types";

import type { Point } from "../lib/mapViewerViewport";

export interface MapViewerViewportSlice {
  isViewportDragging: boolean;
  viewportPan: Point;
  viewportZoom: number;
  setIsViewportDragging: (isDragging: boolean) => void;
  setViewportPan: (pan: Point) => void;
  setViewportView: (view: { pan: Point; zoom: number }) => void;
  setViewportZoom: (zoom: number) => void;
}

export const createMapViewerViewportSlice: StateCreator<AppStore, [], [], MapViewerViewportSlice> = (set) => ({
  isViewportDragging: false,
  viewportPan: { x: 0, y: 0 },
  viewportZoom: 1,
  setIsViewportDragging: (isDragging) => set({ isViewportDragging: isDragging }),
  setViewportPan: (pan) => set({ viewportPan: pan }),
  setViewportView: (view) => set({ viewportPan: view.pan, viewportZoom: view.zoom }),
  setViewportZoom: (zoom) => set({ viewportZoom: zoom }),
});
