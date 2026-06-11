export type EditorMode = 'select' | 'object' | 'node' | 'path';

export type ToolboxObjectType =
  | 'room'
  | 'wall'
  | 'door'
  | 'hallway'
  | 'stairs'
  | 'elevator'
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
