import { StateCreator } from "zustand";

import type { EditorStore } from "@/store/types";

import { EditorMapObject } from "../types/map.types";
import { ObjectSlice } from "./types";

export const createObjectSlice: StateCreator<EditorStore, [], [], ObjectSlice> = (set, get) => ({
  objects: {},

  setObjects: (objectsList) => {
    const objectsRecord = objectsList.reduce((acc, obj) => {
      acc[obj.id] = obj;
      return acc;
    }, {} as Record<string, EditorMapObject>);
    set({ objects: objectsRecord });
  },

  addObject: (object) => {
    set((state) => ({
      objects: { ...state.objects, [object.id]: { ...object, _dirty: true } },
      isDirty: true,
    }));
  },

  updateObject: (id, updates) => {
    set((state) => {
      const existing = state.objects[id];
      if (!existing) return {};
      return {
        objects: {
          ...state.objects,
          [id]: { ...existing, ...updates, _dirty: true },
        },
        isDirty: true,
      };
    });
  },

  removeObject: (id) => {
    set((state) => {
      const { [id]: _, ...remainingObjects } = state.objects;
      const wasSelected = state.selectedEntity?.kind === 'object' && state.selectedEntity.id === id;
      
      // Also remove any nodes associated with this object!
      // This is a helpful cleanup so we don't have orphaned nodes.
      const updatedNodes = { ...state.nodes };
      let nodesChanged = false;
      Object.keys(updatedNodes).forEach((nodeId) => {
        if (updatedNodes[nodeId].objectId === id) {
          updatedNodes[nodeId] = { ...updatedNodes[nodeId], objectId: null, _dirty: true };
          nodesChanged = true;
        }
      });

      return {
        objects: remainingObjects,
        selectedEntity: wasSelected ? null : state.selectedEntity,
        isDirty: true,
        ...(nodesChanged ? { nodes: updatedNodes } : {}),
      };
    });
  },

  moveObject: (id, x, y) => {
    set((state) => {
      const existing = state.objects[id];
      if (!existing) return {};
      return {
        objects: {
          ...state.objects,
          [id]: { ...existing, x, y, _dirty: true },
        },
        isDirty: true,
      };
    });
  },
});
