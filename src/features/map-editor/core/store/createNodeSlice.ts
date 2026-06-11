import { StateCreator } from "zustand";

import type { EditorStore } from "@/store/types";

import { EditorMapNode } from "../types/map.types";
import { NodeSlice } from "./types";

export const createNodeSlice: StateCreator<EditorStore, [], [], NodeSlice> = (set, get) => ({
  nodes: {},
  pendingPathNodeId: null,

  setNodes: (nodesList) => {
    const nodesRecord = nodesList.reduce((acc, node) => {
      acc[node.id] = node;
      return acc;
    }, {} as Record<string, EditorMapNode>);
    set({ nodes: nodesRecord });
  },

  addNode: (node) => {
    set((state) => ({
      nodes: { ...state.nodes, [node.id]: { ...node, _dirty: true } },
      isDirty: true,
    }));
  },

  updateNode: (id, updates) => {
    set((state) => {
      const existing = state.nodes[id];
      if (!existing) return {};
      return {
        nodes: {
          ...state.nodes,
          [id]: { ...existing, ...updates, _dirty: true },
        },
        isDirty: true,
      };
    });
  },

  removeNode: (id) => {
    set((state) => {
      const { [id]: _, ...remainingNodes } = state.nodes;
      const wasSelected = state.selectedEntity?.kind === 'node' && state.selectedEntity.id === id;

      // Clean up any path edges connected to this node
      const updatedEdges = { ...state.edges };
      let edgesChanged = false;
      Object.keys(updatedEdges).forEach((edgeId) => {
        const edge = updatedEdges[edgeId];
        if (edge.fromNodeId === id || edge.toNodeId === id) {
          delete updatedEdges[edgeId];
          edgesChanged = true;
        }
      });

      return {
        nodes: remainingNodes,
        selectedEntity: wasSelected ? null : state.selectedEntity,
        pendingPathNodeId: state.pendingPathNodeId === id ? null : state.pendingPathNodeId,
        isDirty: true,
        ...(edgesChanged ? { edges: updatedEdges } : {}),
      };
    });
  },

  setPendingPathNode: (pendingPathNodeId) => set({ pendingPathNodeId }),
});
