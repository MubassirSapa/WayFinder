export interface LinkableFloorLinkNode {
  id: string;
  buildingId: string;
  floorId: string;
  floorName: string;
  floorLevel: number;
  role: "stairs_entry" | "elevator_entry" | "escalator_entry";
  label: string;
  x: number;
  y: number;
  isAccessible: boolean;
}

export interface CrossFloorLink {
  id: string;
  fromNodeId: string;
  fromNodeLabel: string;
  fromFloorName: string;
  toNodeId: string;
  toNodeLabel: string;
  toFloorName: string;
  type: "stairs" | "elevator" | "escalator";
  distanceMeters: number;
}
