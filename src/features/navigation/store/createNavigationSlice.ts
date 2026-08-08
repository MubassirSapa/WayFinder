import type { StateCreator } from "zustand";

import type { AppStore } from "@/store/types";

export interface NavigationSlice {
  originNodeId: string | null;
  destinationNodeId: string | null;
  accessibleOnly: boolean;
  activeSegmentIndex: number;
  // Which floor the map viewer is currently displaying — lives here (not as
  // component-local state) so it and activeSegmentIndex can never drift apart:
  // every place that changes "current floor" writes both through this store.
  activeFloorId: string | null;
  // The map's route-search drawer's open state. Lives here rather than as
  // component-local state because more than one place needs to affect it:
  // MapSelectionBar owns its own trigger, but MapViewerShell also needs to
  // close it on a background map click, and it auto-closes itself once both
  // endpoints are set — all reading/writing the one shared value instead of
  // each keeping a separate, driftable copy.
  isRouteSearchOpen: boolean;
  setOrigin: (nodeId: string | null) => void;
  setDestination: (nodeId: string | null) => void;
  setAccessibleOnly: (value: boolean) => void;
  setActiveSegmentIndex: (index: number) => void;
  setActiveFloorId: (floorId: string | null) => void;
  setRouteSearchOpen: (open: boolean) => void;
  clearRoute: () => void;
  resetNavigation: () => void;
}

export const createNavigationSlice: StateCreator<AppStore, [], [], NavigationSlice> = (set) => ({
  accessibleOnly: false,
  activeFloorId: null,
  activeSegmentIndex: 0,
  clearRoute: () => set({
    activeSegmentIndex: 0,
    destinationNodeId: null,
    isRouteSearchOpen: false,
    originNodeId: null,
  }),
  destinationNodeId: null,
  isRouteSearchOpen: false,
  originNodeId: null,
  resetNavigation: () => set({
    accessibleOnly: false,
    activeFloorId: null,
    activeSegmentIndex: 0,
    destinationNodeId: null,
    isRouteSearchOpen: false,
    originNodeId: null,
  }),
  setAccessibleOnly: (value) => set({ accessibleOnly: value }),
  setActiveFloorId: (floorId) => set({ activeFloorId: floorId }),
  setActiveSegmentIndex: (index) => set({ activeSegmentIndex: index }),
  setDestination: (nodeId) => set({ activeSegmentIndex: 0, destinationNodeId: nodeId }),
  setOrigin: (nodeId) => set({ activeSegmentIndex: 0, originNodeId: nodeId }),
  setRouteSearchOpen: (open) => set({ isRouteSearchOpen: open }),
});
