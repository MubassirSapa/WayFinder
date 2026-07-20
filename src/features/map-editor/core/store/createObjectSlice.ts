import { StateCreator } from "zustand";

import type { AppStore } from "@/store/types";

import { EditorMapNode, EditorMapObject } from "../types/map.types";
import { ObjectSlice } from "./types";

function moveLinkedNode(
  node: EditorMapNode,
  deltaX: number,
  deltaY: number,
): EditorMapNode {
  return {
    ...node,
    x: node.x + deltaX,
    y: node.y + deltaY,
    points: node.points?.map((point) => ({
      ...point,
      x: point.x + deltaX,
      y: point.y + deltaY,
    })) ?? node.points,
    _dirty: true,
  };
}

function updateLinkedNodesForObjectMove(
  state: AppStore,
  objectId: string,
  deltaX: number,
  deltaY: number,
) {
  if (deltaX === 0 && deltaY === 0) {
    return null;
  }

  let nodesChanged = false;
  const updatedNodes = { ...state.nodes };

  Object.keys(updatedNodes).forEach((nodeId) => {
    const node = updatedNodes[nodeId];

    if (node.objectId !== objectId) {
      return;
    }

    updatedNodes[nodeId] = moveLinkedNode(node, deltaX, deltaY);
    nodesChanged = true;
  });

  return nodesChanged ? updatedNodes : null;
}

export const createObjectSlice: StateCreator<AppStore, [], [], ObjectSlice> = (set) => ({
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

      const nextX = updates.x ?? existing.x;
      const nextY = updates.y ?? existing.y;
      const deltaX = nextX - existing.x;
      const deltaY = nextY - existing.y;
      const updatedNodes = updateLinkedNodesForObjectMove(
        state,
        id,
        deltaX,
        deltaY,
      );

      return {
        objects: {
          ...state.objects,
          [id]: { ...existing, ...updates, _dirty: true },
        },
        ...(updatedNodes ? { nodes: updatedNodes } : {}),
        isDirty: true,
      };
    });
  },

  removeObject: (id) => {
    set((state) => {
      const remainingObjects = { ...state.objects };
      delete remainingObjects[id];
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

      const deltaX = x - existing.x;
      const deltaY = y - existing.y;
      const updatedNodes = updateLinkedNodesForObjectMove(
        state,
        id,
        deltaX,
        deltaY,
      );

      return {
        objects: {
          ...state.objects,
          [id]: { ...existing, x, y, _dirty: true },
        },
        ...(updatedNodes ? { nodes: updatedNodes } : {}),
        isDirty: true,
      };
    });
  },

  rotateObject: (id, rotation) => {
    set((state) => {
      const existing = state.objects[id];
      if (!existing) return {};
      return {
        objects: {
          ...state.objects,
          [id]: { ...existing, rotation, _dirty: true },
        },
        isDirty: true,
      };
    });
  },
});
