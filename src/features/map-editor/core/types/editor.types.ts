import type {
  EditorFloor,
  EditorMapObject,
  EditorMapNode,
  EditorPathEdge,
} from './map.types';

export type EditorMode = 'select' | 'node' | 'path';

export interface FloorEditorData {
  floor: EditorFloor;
  objects: EditorMapObject[];
  nodes: EditorMapNode[];
  edges: EditorPathEdge[];
}

export interface UploadedReferenceImage {
  alt: string;
  filename: string | null;
  id: string;
  url: string | null;
}

export type ToolboxObjectType =
  | 'room'
  | 'wall'
  | 'door'
  | 'hallway'
  | 'stairs'
  | 'elevator'
  | 'escalator'
  | 'washroom'
  | 'exit'
  | 'poi'
  | 'aisle'
  | 'shelf'
  | 'section';

export type SelectedEntity =
  | { kind: 'object'; id: string }
  | { kind: 'node'; id: string }
  | { kind: 'edge'; id: string }
  | null;
