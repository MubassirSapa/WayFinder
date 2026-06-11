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
  nodes: EditorMapNode[];
  edges: EditorPathEdge[];
  autoCreateNodes: boolean;
  autoConnectNodes: boolean;
  metersPerPixel?: number | null;
}

interface BuildSmartObjectArtifactsResult {
  nodes: EditorMapNode[];
  edges: EditorPathEdge[];
}

export function buildSmartObjectArtifacts({
  object,
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
    const generatedNode = buildSmartNodeForObject(object, workingNodes);
    if (generatedNode) {
      generatedNodes.push(generatedNode);
      workingNodes.push(generatedNode);
    }
  }

  const sourceNode =
    generatedNodes[0] ?? workingNodes.find((node) => node.objectId === object.id) ?? null;

  const generatedEdges: EditorPathEdge[] = [];

  if (autoConnectNodes && sourceNode) {
    const generatedEdge = buildNearestHallwayConnection(
      sourceNode,
      workingNodes,
      edges,
      scale,
    );

    if (generatedEdge) {
      generatedEdges.push(generatedEdge);
    }
  }

  return { nodes: generatedNodes, edges: generatedEdges };
}
