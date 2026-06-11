import { create } from "zustand";

import { createEdgeSlice } from "@/features/map-editor/core/store/createEdgeSlice";
import { createEditorSlice } from "@/features/map-editor/core/store/createEditorSlice";
import { createNodeSlice } from "@/features/map-editor/core/store/createNodeSlice";
import { createObjectSlice } from "@/features/map-editor/core/store/createObjectSlice";

import type { EditorStore } from "./types";

export const useEditorStore = create<EditorStore>()((...args) => ({
  ...createEditorSlice(...args),
  ...createObjectSlice(...args),
  ...createNodeSlice(...args),
  ...createEdgeSlice(...args),
}));

export * from "./types";
export * from "@/features/map-editor/core/store/selectors";
