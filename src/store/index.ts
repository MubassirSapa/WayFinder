import { create } from "zustand";

import { createSignupFlowSlice } from "@/features/auth/store/createSignupFlowSlice";
import { createEdgeSlice } from "@/features/map-editor/core/store/createEdgeSlice";
import { createEditorSlice } from "@/features/map-editor/core/store/createEditorSlice";
import { createNodeSlice } from "@/features/map-editor/core/store/createNodeSlice";
import { createObjectSlice } from "@/features/map-editor/core/store/createObjectSlice";
import { createSmartBuilderSlice } from "@/features/map-editor/smart-builder/store/createSmartBuilderSlice";
import { createNavigationSlice } from "@/features/navigation/store/createNavigationSlice";

import type { AppStore } from "./types";

export const useAppStore = create<AppStore>()((...args) => ({
  ...createEditorSlice(...args),
  ...createObjectSlice(...args),
  ...createNodeSlice(...args),
  ...createEdgeSlice(...args),
  ...createSmartBuilderSlice(...args),
  ...createNavigationSlice(...args),
  ...createSignupFlowSlice(...args),
}));

export * from "./types";
export * from "@/features/map-editor/core/store/selectors";
export * from "@/features/map-editor/smart-builder/store/selectors";
