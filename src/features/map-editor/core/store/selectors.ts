import type { AppStore } from "@/store/types";

import {
  EditorMapObject,
  EditorMapNode,
  EditorPathEdge,
} from "../types/map.types";

export const selectObjectsList = (state: AppStore): EditorMapObject[] =>
  Object.values(state.objects);

export const selectNodesList = (state: AppStore): EditorMapNode[] =>
  Object.values(state.nodes);

export const selectEdgesList = (state: AppStore): EditorPathEdge[] =>
  Object.values(state.edges);

export const selectSelectedObject = (state: AppStore): EditorMapObject | null => {
  if (state.selectedEntity?.kind !== 'object') return null;
  return state.objects[state.selectedEntity.id] || null;
};

export const selectSelectedNode = (state: AppStore): EditorMapNode | null => {
  if (state.selectedEntity?.kind !== 'node') return null;
  return state.nodes[state.selectedEntity.id] || null;
};

export const selectSelectedEdge = (state: AppStore): EditorPathEdge | null => {
  if (state.selectedEntity?.kind !== 'edge') return null;
  return state.edges[state.selectedEntity.id] || null;
};

export const selectEdgesForNode = (nodeId: string) => (state: AppStore): EditorPathEdge[] => {
  return Object.values(state.edges).filter(
    (edge) => edge.fromNodeId === nodeId || edge.toNodeId === nodeId
  );
};
