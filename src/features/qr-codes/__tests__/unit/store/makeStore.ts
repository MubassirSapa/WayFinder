import { create } from "zustand";

import { createSignupFlowSlice } from "@/features/auth/store/createSignupFlowSlice";
import { createEdgeSlice } from "@/features/map-editor/core/store/createEdgeSlice";
import { createEditorSlice } from "@/features/map-editor/core/store/createEditorSlice";
import { createNodeSlice } from "@/features/map-editor/core/store/createNodeSlice";
import { createObjectSlice } from "@/features/map-editor/core/store/createObjectSlice";
import { createSmartBuilderSlice } from "@/features/map-editor/smart-builder/store/createSmartBuilderSlice";
import { createMapViewerViewportSlice } from "@/features/map-viewer/store/createMapViewerViewportSlice";
import { createNavigationSlice } from "@/features/navigation/store/createNavigationSlice";
import type { AppStore } from "@/store/types";

import { createQrViewerViewportSlice } from "../../../store/createQrViewerViewportSlice";

// Mirrors src/store/index.ts's composition exactly, so this slice is tested
// combined with every other real slice instead of hand-stubbed fields that
// can silently drift from the real store shape.
export function makeStore() {
  return create<AppStore>()((...args) => ({
    ...createEditorSlice(...args),
    ...createObjectSlice(...args),
    ...createNodeSlice(...args),
    ...createEdgeSlice(...args),
    ...createSmartBuilderSlice(...args),
    ...createNavigationSlice(...args),
    ...createSignupFlowSlice(...args),
    ...createMapViewerViewportSlice(...args),
    ...createQrViewerViewportSlice(...args),
  }));
}
