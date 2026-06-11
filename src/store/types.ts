import type {
  EdgeSlice,
  EditorSlice,
  NodeSlice,
  ObjectSlice,
} from "@/features/map-editor/core/store/types";
import type { SmartBuilderSlice } from "@/features/map-editor/smart-builder/store/createSmartBuilderSlice";

export type EditorStore =
  & EditorSlice
  & ObjectSlice
  & NodeSlice
  & EdgeSlice
  & SmartBuilderSlice;

export type {
  EdgeSlice,
  EditorSlice,
  NodeSlice,
  ObjectSlice,
  SmartBuilderSlice,
};
