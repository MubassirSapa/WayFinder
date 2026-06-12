import type { EditorStore } from "@/store/types";

export const selectIsSmartBuilderEnabled = (state: EditorStore): boolean =>
  state.isSmartBuilderEnabled;

export const selectAutoCreateNodes = (state: EditorStore): boolean =>
  state.autoCreateNodes;

export const selectAutoConnectNodes = (state: EditorStore): boolean =>
  state.autoConnectNodes;

export const selectHallwayDrawingPoints = (state: EditorStore) =>
  state.hallwayDrawingPoints;

export const selectHallwayDrawingPointCount = (state: EditorStore): number =>
  state.hallwayDrawingPoints.length;
