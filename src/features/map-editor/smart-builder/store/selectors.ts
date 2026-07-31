import type { AppStore } from "@/store/types";

export const selectIsSmartBuilderEnabled = (state: AppStore): boolean =>
  state.isSmartBuilderEnabled;

export const selectAutoCreateNodes = (state: AppStore): boolean =>
  state.autoCreateNodes;

export const selectAutoConnectNodes = (state: AppStore): boolean =>
  state.autoConnectNodes;

export const selectHallwayDrawingPoints = (state: AppStore) =>
  state.hallwayDrawingPoints;

export const selectHallwayDrawingPointCount = (state: AppStore): number =>
  state.hallwayDrawingPoints.length;
