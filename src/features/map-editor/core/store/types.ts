import { EditorMode, SelectedEntity, ToolboxObjectType } from "../types/editor.types";
import {
  EditorFloor,
  EditorMapObject,
  EditorMapNode,
  EditorPathEdge,
} from "../types/map.types";

export interface EditorSlice {
  mode: EditorMode;
  floor: EditorFloor | null;
  selectedEntity: SelectedEntity;
  selectedToolboxType: ToolboxObjectType;
  isDirty: boolean;
  isLoading: boolean;
  isSaving: boolean;
  setMode: (mode: EditorMode) => void;
  setFloor: (floor: EditorFloor | null) => void;
  selectEntity: (entity: SelectedEntity) => void;
  clearSelection: () => void;
  setSelectedToolboxType: (type: ToolboxObjectType) => void;
  markDirty: (dirty: boolean) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  resetStore: () => void;
}

export interface ObjectSlice {
  objects: Record<string, EditorMapObject>;
  setObjects: (objects: EditorMapObject[]) => void;
  addObject: (object: EditorMapObject) => void;
  updateObject: (id: string, updates: Partial<EditorMapObject>) => void;
  removeObject: (id: string) => void;
  moveObject: (id: string, x: number, y: number) => void;
  rotateObject: (id: string, rotation: number) => void;
}

export interface NodeSlice {
  nodes: Record<string, EditorMapNode>;
  pendingPathNodeId: string | null;
  setNodes: (nodes: EditorMapNode[]) => void;
  addNode: (node: EditorMapNode) => void;
  updateNode: (id: string, updates: Partial<EditorMapNode>) => void;
  removeNode: (id: string) => void;
  moveNode: (id: string, x: number, y: number) => void;
  setPendingPathNode: (id: string | null) => void;
}

export interface EdgeSlice {
  edges: Record<string, EditorPathEdge>;
  setEdges: (edges: EditorPathEdge[]) => void;
  addEdge: (edge: EditorPathEdge) => void;
  updateEdge: (id: string, updates: Partial<EditorPathEdge>) => void;
  removeEdge: (id: string) => void;
}
