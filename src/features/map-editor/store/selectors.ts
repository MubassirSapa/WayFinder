import { EditorStore } from './types';
import { EditorMapObject, EditorMapNode, EditorPathEdge } from '../types/map.types';

export const selectObjectsList = (state: EditorStore): EditorMapObject[] =>
  Object.values(state.objects);

export const selectNodesList = (state: EditorStore): EditorMapNode[] =>
  Object.values(state.nodes);

export const selectEdgesList = (state: EditorStore): EditorPathEdge[] =>
  Object.values(state.edges);

export const selectSelectedObject = (state: EditorStore): EditorMapObject | null => {
  if (state.selectedEntity?.kind !== 'object') return null;
  return state.objects[state.selectedEntity.id] || null;
};

export const selectSelectedNode = (state: EditorStore): EditorMapNode | null => {
  if (state.selectedEntity?.kind !== 'node') return null;
  return state.nodes[state.selectedEntity.id] || null;
};

export const selectSelectedEdge = (state: EditorStore): EditorPathEdge | null => {
  if (state.selectedEntity?.kind !== 'edge') return null;
  return state.edges[state.selectedEntity.id] || null;
};

export const selectEdgesForNode = (nodeId: string) => (state: EditorStore): EditorPathEdge[] => {
  return Object.values(state.edges).filter(
    (edge) => edge.fromNodeId === nodeId || edge.toNodeId === nodeId
  );
};
