import type { StateCreator } from "zustand";

import type { AppStore } from "@/store/types";

import type { Point } from "../lib/canvasViewport";

// Prefixed (not the same "viewportPan"/"viewportZoom" names the map viewer's
// own slice uses) since both live in the same composed AppStore at once -
// see src/features/map-viewer/store/createMapViewerViewportSlice.ts and the
// qrViewer* slice for the same naming reason.
export interface EditorViewportSlice {
  editorViewportPan: Point;
  editorViewportZoom: number;
  // True only while the floor-resize handle (FloorResizeHandle) is being
  // dragged - useCanvasViewport reads this to suppress its usual "floor
  // dimensions changed, re-fit the view" reaction, which would otherwise
  // fire on every mousemove tick of the drag and fight it.
  isResizingFloor: boolean;
  setEditorViewportPan: (pan: Point) => void;
  setEditorViewportView: (view: { pan: Point; zoom: number }) => void;
  setEditorViewportZoom: (zoom: number) => void;
  setIsResizingFloor: (isResizing: boolean) => void;
}

export const createEditorViewportSlice: StateCreator<AppStore, [], [], EditorViewportSlice> = (set) => ({
  editorViewportPan: { x: 0, y: 0 },
  editorViewportZoom: 1,
  isResizingFloor: false,
  setEditorViewportPan: (pan) => set({ editorViewportPan: pan }),
  setEditorViewportView: (view) => set({ editorViewportPan: view.pan, editorViewportZoom: view.zoom }),
  setEditorViewportZoom: (zoom) => set({ editorViewportZoom: zoom }),
  setIsResizingFloor: (isResizing) => set({ isResizingFloor: isResizing }),
});
