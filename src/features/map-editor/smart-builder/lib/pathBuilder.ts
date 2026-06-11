import { pixelsToMeters, pixelDistance, type Point } from "@/features/map-editor/core/lib/distance";
import type {
  EditorMapNode,
  EditorPathEdge,
} from "@/features/map-editor/core/types/map.types";
import {
  edgeExistsBetweenNodes,
  findReusableHallwayNodeAtPoint,
} from "./autoConnect";

function createTempNodeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `temp_node_${crypto.randomUUID()}`;
  }

  return `temp_node_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function createTempEdgeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `temp_edge_${crypto.randomUUID()}`;
  }

  return `temp_edge_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

interface BuildHallwayPathInput {
  points: Point[];
  floorId: string;
  buildingId: string;
  metersPerPixel?: number | null;
  existingNodes?: EditorMapNode[];
  existingEdges?: EditorPathEdge[];
}

interface BuildHallwayPathResult {
  nodes: EditorMapNode[];
  edges: EditorPathEdge[];
}

function expandOrthogonalPoints(points: Point[]): Point[] {
  return points.reduce<Point[]>((expandedPoints, point, index) => {
    if (index === 0) {
      return [point];
    }

    const previousPoint = expandedPoints[expandedPoints.length - 1];

    if (previousPoint.x !== point.x && previousPoint.y !== point.y) {
      expandedPoints.push({
        x: point.x,
        y: previousPoint.y,
      });
    }

    expandedPoints.push(point);
    return expandedPoints;
  }, []);
}

export function buildHallwayPath({
  points,
  floorId,
  buildingId,
  metersPerPixel,
  existingNodes = [],
  existingEdges = [],
}: BuildHallwayPathInput): BuildHallwayPathResult {
  if (points.length < 2) {
    return { nodes: [], edges: [] };
  }

  const scale = metersPerPixel ?? 0.05;
  const orthogonalPoints = expandOrthogonalPoints(points);
  const newNodes: EditorMapNode[] = [];
  const allNodes: EditorMapNode[] = [];

  for (const point of orthogonalPoints) {
    const reusable = findReusableHallwayNodeAtPoint(point, [
      ...existingNodes,
      ...newNodes,
    ]);

    if (reusable) {
      allNodes.push(reusable);
    } else {
      const id = createTempNodeId();
      const node: EditorMapNode = {
        id,
        floorId,
        buildingId,
        objectId: null,
        role: "hallway_point",
        label: `Hallway ${allNodes.length + 1}`,
        x: point.x,
        y: point.y,
        geometryType: "icon",
        isAccessible: true,
        _clientId: id,
        _dirty: true,
      };
      allNodes.push(node);
      newNodes.push(node);
    }
  }

  const workingEdges = [...existingEdges];
  const newEdges: EditorPathEdge[] = [];

  for (let i = 0; i < allNodes.length - 1; i++) {
    const fromNode = allNodes[i];
    const toNode = allNodes[i + 1];

    if (edgeExistsBetweenNodes(workingEdges, fromNode.id, toNode.id)) {
      continue;
    }

    const edgeId = createTempEdgeId();
    const edge: EditorPathEdge = {
      id: edgeId,
      floorId,
      buildingId,
      fromNodeId: fromNode.id,
      toNodeId: toNode.id,
      type: "walkway",
      distanceMeters: pixelsToMeters(pixelDistance(fromNode, toNode), scale),
      bidirectional: true,
      isAccessible: true,
      _clientId: edgeId,
      _dirty: true,
    };

    newEdges.push(edge);
    workingEdges.push(edge);
  }

  return { nodes: newNodes, edges: newEdges };
}
