import { pixelDistance, pixelsToMeters } from "@/features/map-editor/core/lib/distance";
import type {
  EditorMapNode,
  EditorMapObject,
  EditorPathEdge,
} from "@/features/map-editor/core/types/map.types";

const DEFAULT_MAX_CONNECTION_DISTANCE = 120;
const HALLWAY_NODE_REUSE_DISTANCE = 16;
const COORDINATE_TOLERANCE = 0.5;
const HALLWAY_AXIS_TOLERANCE = 18;

function createTempEdgeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `temp_edge_${crypto.randomUUID()}`;
  }

  return `temp_edge_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function createTempNodeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `temp_node_${crypto.randomUUID()}`;
  }

  return `temp_node_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export function isHallwayPointNode(node: EditorMapNode): boolean {
  return node.role === "hallway_point";
}

function isHallwayObject(object: EditorMapObject): boolean {
  return object.type === "hallway";
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function getObjectCenter(object: EditorMapObject): { x: number; y: number } {
  return {
    x: object.x + object.width / 2,
    y: object.y + object.height / 2,
  };
}

function rotatePoint(
  point: { x: number; y: number },
  angleRadians: number,
): { x: number; y: number } {
  const cos = Math.cos(angleRadians);
  const sin = Math.sin(angleRadians);

  return {
    x: point.x * cos - point.y * sin,
    y: point.x * sin + point.y * cos,
  };
}

function toLocalObjectPoint(
  point: { x: number; y: number },
  object: EditorMapObject,
): { x: number; y: number } {
  const center = getObjectCenter(object);
  return rotatePoint(
    {
      x: point.x - center.x,
      y: point.y - center.y,
    },
    -toRadians(object.rotation || 0),
  );
}

function toWorldObjectPoint(
  localPoint: { x: number; y: number },
  object: EditorMapObject,
): { x: number; y: number } {
  const center = getObjectCenter(object);
  const rotatedPoint = rotatePoint(localPoint, toRadians(object.rotation || 0));

  return {
    x: rotatedPoint.x + center.x,
    y: rotatedPoint.y + center.y,
  };
}

// Projects sourceNode onto the hallway centerline axis.
// Horizontal hallway: node lands at (sourceNode.x, hallway_center_y)
// Vertical hallway:   node lands at (hallway_center_x, sourceNode.y)
function getAxisPointOnObject(
  sourceNode: EditorMapNode,
  object: EditorMapObject,
): { x: number; y: number } {
  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);
  const localPoint = toLocalObjectPoint(sourceNode, object);
  const halfWidth = object.width / 2;
  const halfHeight = object.height / 2;
  const isHorizontal = object.width >= object.height;

  if (isHorizontal) {
    return toWorldObjectPoint(
      {
        x: clamp(localPoint.x, -halfWidth, halfWidth),
        y: 0,
      },
      object,
    );
  }

  return toWorldObjectPoint(
    {
      x: 0,
      y: clamp(localPoint.y, -halfHeight, halfHeight),
    },
    object,
  );
}

function getHallwayAxis(object: EditorMapObject): {
  origin: { x: number; y: number };
  vector: { x: number; y: number };
} {
  const isHorizontal = object.width >= object.height;
  const axisVector = rotatePoint(
    isHorizontal ? { x: 1, y: 0 } : { x: 0, y: 1 },
    toRadians(object.rotation || 0),
  );

  return {
    origin: getObjectCenter(object),
    vector: axisVector,
  };
}

function projectPointOntoAxis(
  point: { x: number; y: number },
  axis: { origin: { x: number; y: number }; vector: { x: number; y: number } },
): { along: number; offAxis: number } {
  const dx = point.x - axis.origin.x;
  const dy = point.y - axis.origin.y;
  const along = dx * axis.vector.x + dy * axis.vector.y;
  const offAxis = Math.abs(dx * -axis.vector.y + dy * axis.vector.x);

  return { along, offAxis };
}

function pointsAreClose(
  a: { x: number; y: number },
  b: { x: number; y: number },
  tolerance: number = COORDINATE_TOLERANCE,
): boolean {
  return Math.abs(a.x - b.x) <= tolerance && Math.abs(a.y - b.y) <= tolerance;
}

function getClosestPointOnObject(
  sourceNode: EditorMapNode,
  object: EditorMapObject,
): { x: number; y: number } {
  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);
  const localPoint = toLocalObjectPoint(sourceNode, object);

  return toWorldObjectPoint(
    {
      x: clamp(localPoint.x, -object.width / 2, object.width / 2),
      y: clamp(localPoint.y, -object.height / 2, object.height / 2),
    },
    object,
  );
}

function getDistanceToObject(
  sourceNode: EditorMapNode,
  object: EditorMapObject,
): number {
  return pixelDistance(sourceNode, getClosestPointOnObject(sourceNode, object));
}

export function findNearestHallwayNode(
  sourceNode: EditorMapNode,
  nodes: EditorMapNode[],
  maxDistancePx: number = DEFAULT_MAX_CONNECTION_DISTANCE,
): EditorMapNode | null {
  let nearestNode: EditorMapNode | null = null;
  let nearestDistance = maxDistancePx;

  for (const candidate of nodes) {
    if (
      candidate.id === sourceNode.id ||
      candidate.floorId !== sourceNode.floorId ||
      !isHallwayPointNode(candidate)
    ) {
      continue;
    }

    const distance = pixelDistance(sourceNode, candidate);
    if (distance <= nearestDistance) {
      nearestNode = candidate;
      nearestDistance = distance;
    }
  }

  return nearestNode;
}

export function findNearestHallwayObject(
  sourceNode: EditorMapNode,
  objects: EditorMapObject[],
  maxDistancePx: number = DEFAULT_MAX_CONNECTION_DISTANCE,
): EditorMapObject | null {
  let nearestObject: EditorMapObject | null = null;
  let nearestDistance = maxDistancePx;

  for (const candidate of objects) {
    if (
      candidate.floorId !== sourceNode.floorId ||
      !isHallwayObject(candidate)
    ) {
      continue;
    }

    const distance = getDistanceToObject(sourceNode, candidate);
    if (distance <= nearestDistance) {
      nearestObject = candidate;
      nearestDistance = distance;
    }
  }

  return nearestObject;
}

export function findLinkedHallwayNodeForObject(
  hallwayObjectId: string,
  targetPoint: { x: number; y: number },
  nodes: EditorMapNode[],
): EditorMapNode | null {
  return (
    nodes.find(
      (node) =>
        node.objectId === hallwayObjectId &&
        node.role === "hallway_point" &&
        pixelDistance(node, targetPoint) <= HALLWAY_NODE_REUSE_DISTANCE,
    ) ?? null
  );
}

export function findReusableHallwayNodeAtPoint(
  targetPoint: { x: number; y: number },
  nodes: EditorMapNode[],
): EditorMapNode | null {
  return (
    nodes.find(
      (node) =>
        node.role === "hallway_point" &&
        pixelDistance(node, targetPoint) <= HALLWAY_NODE_REUSE_DISTANCE,
    ) ?? null
  );
}

export function buildHallwayNodeForObject(
  hallwayObject: EditorMapObject,
  sourceNode: EditorMapNode,
  nodes: EditorMapNode[],
): EditorMapNode | null {
  const point = getAxisPointOnObject(sourceNode, hallwayObject);

  if (
    findReusableHallwayNodeAtPoint(point, nodes) ||
    findLinkedHallwayNodeForObject(hallwayObject.id, point, nodes)
  ) {
    return null;
  }

  const id = createTempNodeId();

  return {
    id,
    floorId: hallwayObject.floorId,
    buildingId: hallwayObject.buildingId,
    objectId: hallwayObject.id,
    role: "hallway_point",
    label: hallwayObject.label || hallwayObject.name || "Hallway",
    x: point.x,
    y: point.y,
    geometryType: "icon",
    isAccessible: hallwayObject.isAccessible,
    _clientId: id,
    _dirty: true,
  };
}

export function edgeExistsBetweenNodes(
  edges: EditorPathEdge[],
  fromNodeId: string,
  toNodeId: string,
): boolean {
  return edges.some((edge) => {
    if (edge.fromNodeId === fromNodeId && edge.toNodeId === toNodeId) {
      return true;
    }

    return (
      edge.fromNodeId === toNodeId &&
      edge.toNodeId === fromNodeId &&
      edge.bidirectional
    );
  });
}

export function buildConnectionEdge(
  fromNode: EditorMapNode,
  toNode: EditorMapNode,
  edges: EditorPathEdge[],
  metersPerPixel: number = 0.05,
): EditorPathEdge | null {
  if (
    fromNode.floorId !== toNode.floorId ||
    edgeExistsBetweenNodes(edges, fromNode.id, toNode.id)
  ) {
    return null;
  }

  const id = createTempEdgeId();

  return {
    id,
    floorId: fromNode.floorId,
    buildingId: fromNode.buildingId,
    fromNodeId: fromNode.id,
    toNodeId: toNode.id,
    type: "walkway",
    distanceMeters: pixelsToMeters(pixelDistance(fromNode, toNode), metersPerPixel),
    bidirectional: true,
    isAccessible: fromNode.isAccessible && toNode.isAccessible,
    _clientId: id,
    _dirty: true,
  };
}

function findDirectEdgeIdBetweenNodes(
  edges: EditorPathEdge[],
  fromNodeId: string,
  toNodeId: string,
): string | null {
  return (
    edges.find((edge) => {
      if (edge.fromNodeId === fromNodeId && edge.toNodeId === toNodeId) {
        return true;
      }

      return (
        edge.fromNodeId === toNodeId &&
        edge.toNodeId === fromNodeId &&
        edge.bidirectional
      );
    })?.id ?? null
  );
}

function buildHallwayAxisStitchEdges(
  hallwayNode: EditorMapNode,
  hallwayObject: EditorMapObject,
  nodes: EditorMapNode[],
  edges: EditorPathEdge[],
  metersPerPixel: number,
): { edges: EditorPathEdge[]; edgesToRemove: string[] } {
  const axis = getHallwayAxis(hallwayObject);
  const hallwayProjection = projectPointOntoAxis(hallwayNode, axis);
  let previous: { node: EditorMapNode; along: number } | null = null;
  let next: { node: EditorMapNode; along: number } | null = null;

  for (const candidate of nodes) {
    if (
      candidate.id === hallwayNode.id ||
      candidate.floorId !== hallwayNode.floorId ||
      !isHallwayPointNode(candidate)
    ) {
      continue;
    }

    const projection = projectPointOntoAxis(candidate, axis);
    if (projection.offAxis > HALLWAY_AXIS_TOLERANCE) {
      continue;
    }

    if (projection.along < hallwayProjection.along) {
      if (!previous || projection.along > previous.along) {
        previous = { node: candidate, along: projection.along };
      }
      continue;
    }

    if (projection.along > hallwayProjection.along) {
      if (!next || projection.along < next.along) {
        next = { node: candidate, along: projection.along };
      }
    }
  }

  const workingEdges = [...edges];
  const generatedEdges: EditorPathEdge[] = [];

  for (const neighbor of [previous?.node, next?.node]) {
    if (!neighbor) {
      continue;
    }

    const edge = buildConnectionEdge(
      hallwayNode,
      neighbor,
      workingEdges,
      metersPerPixel,
    );

    if (edge) {
      generatedEdges.push(edge);
      workingEdges.push(edge);
    }
  }

  const edgesToRemove =
    previous && next
      ? [findDirectEdgeIdBetweenNodes(edges, previous.node.id, next.node.id)].filter(
          (edgeId): edgeId is string => edgeId !== null,
        )
      : [];

  return { edges: generatedEdges, edgesToRemove };
}

function nodesAreAligned(a: EditorMapNode, b: EditorMapNode): boolean {
  return (
    Math.abs(a.x - b.x) <= COORDINATE_TOLERANCE ||
    Math.abs(a.y - b.y) <= COORDINATE_TOLERANCE
  );
}

function findExistingHallwayAxisNode(
  hallwayObject: EditorMapObject,
  axisPoint: { x: number; y: number },
  nodes: EditorMapNode[],
): EditorMapNode | null {
  return (
    nodes.find(
      (node) =>
        node.floorId === hallwayObject.floorId &&
        node.objectId === hallwayObject.id &&
        isHallwayPointNode(node) &&
        pointsAreClose(node, axisPoint),
    ) ??
    findReusableHallwayNodeAtPoint(axisPoint, nodes) ??
    findLinkedHallwayNodeForObject(hallwayObject.id, axisPoint, nodes)
  );
}

// Connects object nodes to a hallway axis and stitches hallway-axis nodes in line.
// It only uses nearest same-axis hallway neighbors to avoid dense graph wiring.
export function buildNearestHallwayConnection(
  sourceNode: EditorMapNode,
  nodes: EditorMapNode[],
  edges: EditorPathEdge[],
  objects: EditorMapObject[],
  metersPerPixel: number = 0.05,
  maxDistancePx: number = DEFAULT_MAX_CONNECTION_DISTANCE,
): { nodes: EditorMapNode[]; edges: EditorPathEdge[]; edgesToRemove: string[] } {
  if (isHallwayPointNode(sourceNode)) {
    const linkedHallwayObject = sourceNode.objectId
      ? objects.find(
          (object) => object.id === sourceNode.objectId && isHallwayObject(object),
        ) ?? null
      : null;

    if (!linkedHallwayObject) {
      return { nodes: [], edges: [], edgesToRemove: [] };
    }

    const hallwayStitch = buildHallwayAxisStitchEdges(
      sourceNode,
      linkedHallwayObject,
      nodes,
      edges,
      metersPerPixel,
    );

    return {
      nodes: [],
      edges: hallwayStitch.edges,
      edgesToRemove: hallwayStitch.edgesToRemove,
    };
  }

  const hallwayObject = findNearestHallwayObject(sourceNode, objects, maxDistancePx);

  if (!hallwayObject) {
    const nearestNode = findNearestHallwayNode(sourceNode, nodes, maxDistancePx);
    if (!nearestNode) return { nodes: [], edges: [], edgesToRemove: [] };
    if (!nodesAreAligned(sourceNode, nearestNode)) {
      return { nodes: [], edges: [], edgesToRemove: [] };
    }
    const edge = buildConnectionEdge(sourceNode, nearestNode, edges, metersPerPixel);
    return { nodes: [], edges: edge ? [edge] : [], edgesToRemove: [] };
  }

  const axisPoint = getAxisPointOnObject(sourceNode, hallwayObject);
  const existingAxisNode = findExistingHallwayAxisNode(
    hallwayObject,
    axisPoint,
    nodes,
  );
  const axisNode =
    existingAxisNode ??
    buildHallwayNodeForObject(hallwayObject, sourceNode, nodes);

  if (!axisNode) return { nodes: [], edges: [], edgesToRemove: [] };

  const isNew = !existingAxisNode;
  const generatedNodes: EditorMapNode[] = isNew ? [axisNode] : [];
  const doorEdge = buildConnectionEdge(sourceNode, axisNode, edges, metersPerPixel);
  const hallwayStitch = buildHallwayAxisStitchEdges(
    axisNode,
    hallwayObject,
    nodes,
    doorEdge ? [...edges, doorEdge] : edges,
    metersPerPixel,
  );

  return {
    nodes: generatedNodes,
    edges: doorEdge ? [doorEdge, ...hallwayStitch.edges] : hallwayStitch.edges,
    edgesToRemove: hallwayStitch.edgesToRemove,
  };
}
