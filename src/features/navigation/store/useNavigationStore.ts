"use client";

import { create } from "zustand";

interface NavigationState {
  originNodeId: string | null;
  destinationNodeId: string | null;
  accessibleOnly: boolean;
  activeSegmentIndex: number;
  setOrigin: (nodeId: string | null) => void;
  setDestination: (nodeId: string | null) => void;
  setAccessibleOnly: (value: boolean) => void;
  setActiveSegmentIndex: (index: number) => void;
  clearRoute: () => void;
  reset: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  accessibleOnly: false,
  activeSegmentIndex: 0,
  clearRoute: () => set({ activeSegmentIndex: 0, destinationNodeId: null }),
  destinationNodeId: null,
  originNodeId: null,
  reset: () => set({
    accessibleOnly: false,
    activeSegmentIndex: 0,
    destinationNodeId: null,
    originNodeId: null,
  }),
  setAccessibleOnly: (value) => set({ accessibleOnly: value }),
  setActiveSegmentIndex: (index) => set({ activeSegmentIndex: index }),
  setDestination: (nodeId) => set({ activeSegmentIndex: 0, destinationNodeId: nodeId }),
  setOrigin: (nodeId) => set({ activeSegmentIndex: 0, originNodeId: nodeId }),
}));
