import { StateCreator } from 'zustand';
import { EditorSlice, EditorStore } from './types';

export const createEditorSlice: StateCreator<EditorStore, [], [], EditorSlice> = (set, get) => ({
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
