import { StateCreator } from "zustand";

import type { Point } from "@/features/map-editor/core/lib/distance";
import { buildNearestHallwayConnection } from "@/features/map-editor/smart-builder/lib/autoConnect";
import { buildHallwayPath } from "@/features/map-editor/smart-builder/lib/pathBuilder";
import { buildSmartObjectArtifacts } from "@/features/map-editor/smart-builder/lib/smartObjectBuilder";
import type {
  EditorMapNode,
  EditorPathEdge,
} from "@/features/map-editor/core/types/map.types";
import type { AppStore } from "@/store/types";

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
  AppStore,
  [],
  [],
  SmartBuilderSlice
> = (set, get) => ({
  isSmartBuilderEnabled: true,
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
    const scale = state.floor?.metersPerPixel ?? 0.05;
    const objects = Object.values(state.objects);
    const workingNodes = Object.values(state.nodes);
    const workingEdges = Object.values(state.edges);
    const generatedNodes: EditorMapNode[] = [];
    const generatedEdges: EditorPathEdge[] = [];
    const allEdgesToRemove: string[] = [];

    for (const object of objects) {
      const artifacts = buildSmartObjectArtifacts({
        object,
        objects,
        nodes: workingNodes,
        edges: workingEdges,
        autoCreateNodes: true,
        autoConnectNodes: state.autoConnectNodes,
        metersPerPixel: scale,
      });

      generatedNodes.push(...artifacts.nodes);
      generatedEdges.push(...artifacts.edges);
      workingNodes.push(...artifacts.nodes);
      workingEdges.push(...artifacts.edges);

      if (artifacts.edgesToRemove.length > 0) {
        allEdgesToRemove.push(...artifacts.edgesToRemove);
        for (const id of artifacts.edgesToRemove) {
          const idx = workingEdges.findIndex((e) => e.id === id);
          if (idx !== -1) workingEdges.splice(idx, 1);
        }
      }
    }

    allEdgesToRemove.forEach((id) => state.removeEdge(id));
    generatedNodes.forEach((node) => state.addNode(node));
    generatedEdges.forEach((edge) => state.addEdge(edge));
    return generatedNodes.length;
  },

  autoConnectExistingNodes: () => {
    const state = get();
    const scale = state.floor?.metersPerPixel ?? 0.05;
    const nodes = Object.values(state.nodes);
    const generatedNodes: EditorMapNode[] = [];
    const generatedEdges: EditorPathEdge[] = [];
    const allEdgesToRemove: string[] = [];
    const workingEdges = Object.values(state.edges);

    for (const node of nodes) {
      if (!node.objectId) {
        continue;
      }

      const result = buildNearestHallwayConnection(
        node,
        nodes,
        workingEdges,
        Object.values(state.objects),
        scale,
      );

      if (result.nodes.length > 0) {
        generatedNodes.push(...result.nodes);
        nodes.push(...result.nodes);
      }

      if (result.edges.length > 0) {
        generatedEdges.push(...result.edges);
        workingEdges.push(...result.edges);
      }

      if (result.edgesToRemove.length > 0) {
        allEdgesToRemove.push(...result.edgesToRemove);
        for (const id of result.edgesToRemove) {
          const idx = workingEdges.findIndex((e) => e.id === id);
          if (idx !== -1) workingEdges.splice(idx, 1);
        }
      }
    }

    allEdgesToRemove.forEach((id) => state.removeEdge(id));
    generatedNodes.forEach((node) => state.addNode(node));
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
      existingNodes: Object.values(state.nodes),
      existingEdges: Object.values(state.edges),
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

    const { nodes, edges, edgesToRemove } = buildSmartObjectArtifacts({
      object,
      objects: Object.values(state.objects),
      nodes: Object.values(state.nodes),
      edges: Object.values(state.edges),
      autoCreateNodes: state.autoCreateNodes,
      autoConnectNodes: state.autoConnectNodes,
      metersPerPixel: state.floor.metersPerPixel,
    });

    edgesToRemove.forEach((id) => state.removeEdge(id));
    nodes.forEach((node) => state.addNode(node));
    edges.forEach((edge) => state.addEdge(edge));

    return {
      nodesAdded: nodes.length,
      edgesAdded: edges.length,
    };
  },
});
