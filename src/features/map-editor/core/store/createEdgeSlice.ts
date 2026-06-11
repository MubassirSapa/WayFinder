import { StateCreator } from "zustand";

import type { EditorStore } from "@/store/types";

import { EditorPathEdge } from "../types/map.types";
import { EdgeSlice } from "./types";

export const createEdgeSlice: StateCreator<EditorStore, [], [], EdgeSlice> = (set, get) => ({
  edges: {},

  setEdges: (edgesList) => {
    const edgesRecord = edgesList.reduce((acc, edge) => {
      acc[edge.id] = edge;
      return acc;
    }, {} as Record<string, EditorPathEdge>);
    set({ edges: edgesRecord });
  },

  addEdge: (edge) => {
    set((state) => ({
      edges: { ...state.edges, [edge.id]: { ...edge, _dirty: true } },
      isDirty: true,
    }));
  },

  updateEdge: (id, updates) => {
    set((state) => {
      const existing = state.edges[id];
      if (!existing) return {};
      return {
        edges: {
          ...state.edges,
          [id]: { ...existing, ...updates, _dirty: true },
        },
        isDirty: true,
      };
    });
  },

  removeEdge: (id) => {
    set((state) => {
      const { [id]: _, ...remainingEdges } = state.edges;
      const wasSelected = state.selectedEntity?.kind === 'edge' && state.selectedEntity.id === id;
      return {
        edges: remainingEdges,
        selectedEntity: wasSelected ? null : state.selectedEntity,
        isDirty: true,
      };
    });
  },
});
