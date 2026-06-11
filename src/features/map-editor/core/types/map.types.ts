export interface EditorFloor {
  id: string;
  buildingId: string;
  name: string;
  level: number;
  width: number;
  height: number;
  metersPerPixel?: number | null;
  backgroundImageUrl?: string | null;
  status: 'draft' | 'published';
}

export interface EditorMapObject {
  id: string; // database ID if saved, or client-generated ID
  floorId: string;
  buildingId: string;
  parentObjectId: string | null;
  type:
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
  name: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  isSearchable: boolean;
  isAccessible: boolean;
  _clientId?: string; // used to link unsaved local references
  _dirty?: boolean;
}

export interface EditorMapNodePoint {
  x: number;
  y: number;
  id?: string | null;
}

export interface EditorMapNode {
  id: string;
  floorId: string;
  buildingId: string;
  objectId: string | null;
  role: 'entrance' | 'exit' | 'hallway_point' | 'stairs_entry' | 'elevator_entry' | 'shelf_access';
  label: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  geometryType: 'rectangle' | 'polygon' | 'line' | 'icon';
  points?: EditorMapNodePoint[] | null;
  isAccessible: boolean;
  _clientId?: string;
  _dirty?: boolean;
}

export interface EditorPathEdge {
  id: string;
  floorId: string;
  buildingId: string;
  fromNodeId: string;
  toNodeId: string;
  type: 'walkway' | 'stairs' | 'elevator' | 'ramp';
  distanceMeters: number;
  bidirectional: boolean;
  isAccessible: boolean;
  _clientId?: string;
  _dirty?: boolean;
}
