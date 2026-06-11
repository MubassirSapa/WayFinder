import { StateCreator } from "zustand";

import type { Point } from "@/features/map-editor/core/lib/distance";
import { buildNearestHallwayConnection } from "@/features/map-editor/smart-builder/lib/autoConnect";
import { buildSmartNodeForObject } from "@/features/map-editor/smart-builder/lib/nodePlacement";
import { buildHallwayPath } from "@/features/map-editor/smart-builder/lib/pathBuilder";
import { buildSmartObjectArtifacts } from "@/features/map-editor/smart-builder/lib/smartObjectBuilder";
import type { EditorStore } from "@/store/types";

export interface SmartBuilderSlice {
  isSmartBuilderEnabled: boolean;
  autoCreateNodes: boolean;
  autoConnectNodes: boolean;
  hallwayDrawingPoints: Point[];
  setSmartBuilderEnabled: (value: boolean) => void;
  setAutoCreateNodes: (value: boolean) => void;
  setAutoConnectNodes: (value: boolean) => void;
  addHallwayDrawingPoint: (point: Point) => void;
  clearHallwayDrawingPoints: () => void;
  generateMissingNodes: () => number;
  autoConnectExistingNodes: () => number;
  finishHallwayPath: () => { nodesAdded: number; edgesAdded: number };
  applySmartBuilderToObject: (objectId: string) => { nodesAdded: number; edgesAdded: number };
}

export const createSmartBuilderSlice: StateCreator<
  EditorStore,
  [],
  [],
  SmartBuilderSlice
> = (set, get) => ({
  isSmartBuilderEnabled: false,
  autoCreateNodes: true,
  autoConnectNodes: true,
  hallwayDrawingPoints: [],

  setSmartBuilderEnabled: (value) =>
    set((state) => ({
      isSmartBuilderEnabled: value,
      hallwayDrawingPoints: value ? state.hallwayDrawingPoints : [],
    })),

  setAutoCreateNodes: (value) => set({ autoCreateNodes: value }),

  setAutoConnectNodes: (value) => set({ autoConnectNodes: value }),

  addHallwayDrawingPoint: (point) =>
    set((state) => ({
      hallwayDrawingPoints: [...state.hallwayDrawingPoints, point],
    })),

  clearHallwayDrawingPoints: () => set({ hallwayDrawingPoints: [] }),

  generateMissingNodes: () => {
    const state = get();
    const existingNodes = Object.values(state.nodes);
    const generatedNodes = [];

    for (const object of Object.values(state.objects)) {
      const generatedNode = buildSmartNodeForObject(object, [
        ...existingNodes,
        ...generatedNodes,
      ]);

      if (generatedNode) {
        generatedNodes.push(generatedNode);
      }
    }

    generatedNodes.forEach((node) => state.addNode(node));
    return generatedNodes.length;
  },

  autoConnectExistingNodes: () => {
    const state = get();
    const scale = state.floor?.metersPerPixel ?? 0.05;
    const nodes = Object.values(state.nodes);
    const generatedEdges = [];
    const workingEdges = Object.values(state.edges);

    for (const node of nodes) {
      if (!node.objectId) {
        continue;
      }

      const generatedEdge = buildNearestHallwayConnection(
        node,
        nodes,
        workingEdges,
        scale,
      );

      if (generatedEdge) {
        generatedEdges.push(generatedEdge);
        workingEdges.push(generatedEdge);
      }
    }

    generatedEdges.forEach((edge) => state.addEdge(edge));
    return generatedEdges.length;
  },

  finishHallwayPath: () => {
    const state = get();

    if (!state.floor || state.hallwayDrawingPoints.length < 2) {
      return { nodesAdded: 0, edgesAdded: 0 };
    }

    const { nodes, edges } = buildHallwayPath({
      points: state.hallwayDrawingPoints,
      floorId: state.floor.id,
      buildingId: state.floor.buildingId,
      metersPerPixel: state.floor.metersPerPixel,
    });

    nodes.forEach((node) => state.addNode(node));
    edges.forEach((edge) => state.addEdge(edge));
    state.clearHallwayDrawingPoints();

    return {
      nodesAdded: nodes.length,
      edgesAdded: edges.length,
    };
  },

  applySmartBuilderToObject: (objectId) => {
    const state = get();

    if (
      !state.floor ||
      !state.isSmartBuilderEnabled ||
      (!state.autoCreateNodes && !state.autoConnectNodes)
    ) {
      return { nodesAdded: 0, edgesAdded: 0 };
    }

    const object = state.objects[objectId];
    if (!object) {
      return { nodesAdded: 0, edgesAdded: 0 };
    }

    const { nodes, edges } = buildSmartObjectArtifacts({
      object,
      nodes: Object.values(state.nodes),
      edges: Object.values(state.edges),
      autoCreateNodes: state.autoCreateNodes,
      autoConnectNodes: state.autoConnectNodes,
      metersPerPixel: state.floor.metersPerPixel,
    });

    nodes.forEach((node) => state.addNode(node));
    edges.forEach((edge) => state.addEdge(edge));

    return {
      nodesAdded: nodes.length,
      edgesAdded: edges.length,
    };
  },
});
