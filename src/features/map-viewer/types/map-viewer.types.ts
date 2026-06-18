export interface ViewerFloor {
  id: string;
  buildingId: string;
  name: string;
  level: number;
  width: number;
  height: number;
  metersPerPixel?: number | null;
  backgroundImageUrl?: string | null;
  status: "draft" | "published";
}

export type ViewerObjectType =
  | "room"
  | "wall"
  | "door"
  | "hallway"
  | "stairs"
  | "elevator"
  | "washroom"
  | "exit"
  | "poi"
  | "aisle"
  | "shelf"
  | "section";

export interface ViewerMapObject {
  id: string;
  floorId: string;
  buildingId: string;
  parentObjectId: string | null;
  type: ViewerObjectType;
  name: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  isSearchable: boolean;
  isAccessible: boolean;
}

export interface ViewerMapNodePoint {
  id?: string | null;
  x: number;
  y: number;
}

export type ViewerNodeRole =
  | "entrance"
  | "exit"
  | "hallway_point"
  | "stairs_entry"
  | "elevator_entry"
  | "shelf_access";

export interface ViewerMapNode {
  id: string;
  floorId: string;
  buildingId: string;
  objectId: string | null;
  role: ViewerNodeRole;
  label: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  geometryType: "rectangle" | "polygon" | "line" | "icon";
  points?: ViewerMapNodePoint[] | null;
  isAccessible: boolean;
}

export interface ViewerPathEdge {
  id: string;
  floorId: string;
  buildingId: string;
  fromNodeId: string;
  toNodeId: string;
  type: "walkway" | "stairs" | "elevator" | "ramp";
  distanceMeters: number;
  bidirectional: boolean;
  isAccessible: boolean;
}

export interface MapViewerData {
  edgesByFloorId: Record<string, ViewerPathEdge[]>;
  floors: ViewerFloor[];
  initialFloorId: string | null;
  nodesByFloorId: Record<string, ViewerMapNode[]>;
  objectsByFloorId: Record<string, ViewerMapObject[]>;
}
