import { StateCreator } from "zustand";

import type { AppStore } from "@/store/types";

import { EditorSlice } from "./types";

export const createEditorSlice: StateCreator<AppStore, [], [], EditorSlice> = (set, get) => ({
  mode: 'select',
  floor: null,
  selectedEntity: null,
  selectedToolboxType: 'room',
  isDirty: false,
  isLoading: false,
  isSaving: false,

  setMode: (mode) => {
    // If exiting path mode, clear pending node
    if (mode !== 'path') {
      get().setPendingPathNode(null);
    }
    set({ mode });
  },
  setFloor: (floor) => set({ floor }),
  updateFloor: (updates) =>
    set((state) => {
      if (!state.floor) {
        return {};
      }

      return {
        floor: {
          ...state.floor,
          ...updates,
          _dirty: true,
        },
        isDirty: true,
      };
    }),
  selectEntity: (selectedEntity) => set({ selectedEntity }),
  clearSelection: () => set({ selectedEntity: null }),
  setSelectedToolboxType: (selectedToolboxType) => set({ selectedToolboxType }),
  markDirty: (isDirty) => set({ isDirty }),
  setLoading: (isLoading) => set({ isLoading }),
  setSaving: (isSaving) => set({ isSaving }),
  resetStore: () =>
    set({
      mode: 'select',
      floor: null,
      selectedEntity: null,
      selectedToolboxType: 'room',
      isDirty: false,
      isLoading: false,
      isSaving: false,
      objects: {},
      nodes: {},
      edges: {},
      pendingPathNodeId: null,
    }),
});
