import { create } from "zustand";

import { createEdgeSlice } from "@/features/map-editor/core/store/createEdgeSlice";
import { createEditorSlice } from "@/features/map-editor/core/store/createEditorSlice";
import { createNodeSlice } from "@/features/map-editor/core/store/createNodeSlice";
import { createObjectSlice } from "@/features/map-editor/core/store/createObjectSlice";
import { createSmartBuilderSlice } from "@/features/map-editor/smart-builder/store/createSmartBuilderSlice";

import type { EditorStore } from "./types";

export const useEditorStore = create<EditorStore>()((...args) => ({
  ...createEditorSlice(...args),
  ...createObjectSlice(...args),
  ...createNodeSlice(...args),
  ...createEdgeSlice(...args),
  ...createSmartBuilderSlice(...args),
}));

export * from "./types";
export * from "@/features/map-editor/core/store/selectors";
export * from "@/features/map-editor/smart-builder/store/selectors";
