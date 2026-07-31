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
  setOrigin: (nodeId: string | null) => void;
  setDestination: (nodeId: string | null) => void;
  setAccessibleOnly: (value: boolean) => void;
  setActiveSegmentIndex: (index: number) => void;
  setActiveFloorId: (floorId: string | null) => void;
  clearRoute: () => void;
  resetNavigation: () => void;
}

export const createNavigationSlice: StateCreator<AppStore, [], [], NavigationSlice> = (set) => ({
  accessibleOnly: false,
  activeFloorId: null,
  activeSegmentIndex: 0,
  clearRoute: () => set({ activeSegmentIndex: 0, destinationNodeId: null }),
  destinationNodeId: null,
  originNodeId: null,
  resetNavigation: () => set({
    accessibleOnly: false,
    activeFloorId: null,
    activeSegmentIndex: 0,
    destinationNodeId: null,
    originNodeId: null,
  }),
  setAccessibleOnly: (value) => set({ accessibleOnly: value }),
  setActiveFloorId: (floorId) => set({ activeFloorId: floorId }),
  setActiveSegmentIndex: (index) => set({ activeSegmentIndex: index }),
  setDestination: (nodeId) => set({ activeSegmentIndex: 0, destinationNodeId: nodeId }),
  setOrigin: (nodeId) => set({ activeSegmentIndex: 0, originNodeId: nodeId }),
});
