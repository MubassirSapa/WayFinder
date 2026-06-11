import type {
  EditorMapNode,
  EditorMapObject,
  EditorPathEdge,
} from "@/features/map-editor/core/types/map.types";

import {
  buildNearestHallwayConnection,
} from "./autoConnect";
import { buildSmartNodeForObject } from "./nodePlacement";

interface BuildSmartObjectArtifactsInput {
  object: EditorMapObject;
  objects: EditorMapObject[];
  nodes: EditorMapNode[];
  edges: EditorPathEdge[];
  autoCreateNodes: boolean;
  autoConnectNodes: boolean;
  metersPerPixel?: number | null;
}

interface BuildSmartObjectArtifactsResult {
  nodes: EditorMapNode[];
  edges: EditorPathEdge[];
  edgesToRemove: string[];
}

export function buildSmartObjectArtifacts({
  object,
  objects,
  nodes,
  edges,
  autoCreateNodes,
  autoConnectNodes,
  metersPerPixel,
}: BuildSmartObjectArtifactsInput): BuildSmartObjectArtifactsResult {
  const generatedNodes: EditorMapNode[] = [];
  const workingNodes = [...nodes];
  const scale = metersPerPixel ?? 0.05;

  if (autoCreateNodes) {
    const generatedNode = buildSmartNodeForObject(object, workingNodes, objects);
    if (generatedNode) {
      generatedNodes.push(generatedNode);
      workingNodes.push(generatedNode);
    }
  }

  const sourceNode =
    generatedNodes[0] ?? workingNodes.find((node) => node.objectId === object.id) ?? null;

  const generatedEdges: EditorPathEdge[] = [];
  const edgesToRemove: string[] = [];

  if (autoConnectNodes && sourceNode) {
    const result = buildNearestHallwayConnection(
      sourceNode,
      workingNodes,
      edges,
      objects,
      scale,
    );

    if (result.nodes.length > 0) {
      generatedNodes.push(...result.nodes);
      workingNodes.push(...result.nodes);
    }

    if (result.edges.length > 0) {
      generatedEdges.push(...result.edges);
    }

    if (result.edgesToRemove.length > 0) {
      edgesToRemove.push(...result.edgesToRemove);
    }
  }

  return { nodes: generatedNodes, edges: generatedEdges, edgesToRemove };
}
