import type { ViewerPathEdge } from "@/features/map-viewer/types/map-viewer.types";

export interface RouteGraphAdjacencyEntry {
  edgeId: string;
  toNodeId: string;
  weight: number;
  floorId: string;
  type: ViewerPathEdge["type"];
}

export type RouteGraphAdjacency = Map<string, RouteGraphAdjacencyEntry[]>;

export interface ShortestPathResult {
  nodeIds: string[];
  edgeIds: string[];
  totalDistanceMeters: number;
}

export interface RouteFloorSegment {
  floorId: string;
  nodeIds: string[];
  edgeIds: string[];
  enterViaEdgeType?: ViewerPathEdge["type"];
}
