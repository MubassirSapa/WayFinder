import type {
  EdgeSlice,
  EditorSlice,
  NodeSlice,
  ObjectSlice,
} from "@/features/map-editor/core/store/types";

export type EditorStore = EditorSlice & ObjectSlice & NodeSlice & EdgeSlice;

export type { EdgeSlice, EditorSlice, NodeSlice, ObjectSlice };
