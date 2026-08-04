import type {
  EdgeSlice,
  EditorSlice,
  NodeSlice,
  ObjectSlice,
} from "@/features/map-editor/core/store/types";
import type { SmartBuilderSlice } from "@/features/map-editor/smart-builder/store/createSmartBuilderSlice";
import type { SignupFlowSlice } from "@/features/auth/store/createSignupFlowSlice";
import type { MapViewerViewportSlice } from "@/features/map-viewer/store/createMapViewerViewportSlice";
import type { NavigationSlice } from "@/features/navigation/store/createNavigationSlice";

export type AppStore =
  & EditorSlice
  & ObjectSlice
  & NodeSlice
  & EdgeSlice
  & SmartBuilderSlice
  & NavigationSlice
  & SignupFlowSlice
  & MapViewerViewportSlice;

export type {
  EdgeSlice,
  EditorSlice,
  MapViewerViewportSlice,
  NavigationSlice,
  NodeSlice,
  ObjectSlice,
  SignupFlowSlice,
  SmartBuilderSlice,
};
