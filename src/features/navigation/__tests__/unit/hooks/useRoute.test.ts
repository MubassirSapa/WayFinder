import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useRoute } from "@/features/navigation/hooks/useRoute";
import * as graphLib from "@/features/navigation/lib/graph";
import type { MapViewerData, ViewerFloor, ViewerMapNode, ViewerPathEdge } from "@/features/map-viewer/types/map-viewer.types";
import { useAppStore } from "@/store";

const floorA: ViewerFloor = {
  id: "floor-a",
  buildingId: "building-1",
  organizationName: null,
  name: "Ground Floor",
  level: 0,
  width: 400,
  height: 300,
  status: "published",
};
const floorB: ViewerFloor = { ...floorA, id: "floor-b", name: "Upper Floor", level: 1 };

const nodeA: ViewerMapNode = {
  id: "node-a",
  floorId: "floor-a",
  buildingId: "building-1",
  objectId: null,
  role: "entrance",
  label: "A",
  x: 0,
  y: 0,
  geometryType: "icon",
  isAccessible: true,
};
const nodeB: ViewerMapNode = { ...nodeA, id: "node-b", role: "hallway_point", label: "B" };
const nodeC: ViewerMapNode = { ...nodeA, id: "node-c", floorId: "floor-b", role: "hallway_point", label: "C" };

const edgeAB: ViewerPathEdge = {
  id: "edge-ab",
  floorId: "floor-a",
  buildingId: "building-1",
  fromNodeId: "node-a",
  toNodeId: "node-b",
  type: "walkway",
  distanceMeters: 5,
  bidirectional: true,
  isAccessible: true,
};
const edgeBC: ViewerPathEdge = { ...edgeAB, id: "edge-bc", fromNodeId: "node-b", toNodeId: "node-c", type: "stairs", isAccessible: false };

const data: MapViewerData = {
  edgesByFloorId: { "floor-a": [edgeAB, edgeBC] },
  floors: [floorA, floorB],
  initialFloorId: "floor-a",
  nodesByFloorId: { "floor-a": [nodeA, nodeB], "floor-b": [nodeC] },
  objectsByFloorId: {},
};

const RESET_NAVIGATION_STATE = {
  accessibleOnly: false,
  activeFloorId: null,
  activeSegmentIndex: 0,
  destinationNodeId: null,
  originNodeId: null,
};

beforeEach(() => {
  useAppStore.setState(RESET_NAVIGATION_STATE);
});

afterEach(() => {
  useAppStore.setState(RESET_NAVIGATION_STATE);
  vi.restoreAllMocks();
});

describe("useRoute graph memoization", () => {
  it("does not rebuild the graph when only the destination changes", () => {
    const buildRouteGraphSpy = vi.spyOn(graphLib, "buildRouteGraph");
    const { result } = renderHook(() => useRoute(data));

    act(() => {
      useAppStore.getState().setOrigin("node-a");
    });
    expect(buildRouteGraphSpy).toHaveBeenCalledTimes(1);

    act(() => {
      useAppStore.getState().setDestination("node-b");
    });
    expect(result.current.route).not.toBeNull();
    expect(buildRouteGraphSpy).toHaveBeenCalledTimes(1);

    act(() => {
      useAppStore.getState().setDestination("node-c");
    });
    expect(buildRouteGraphSpy).toHaveBeenCalledTimes(1);
  });

  it("still rebuilds the graph when accessibleOnly changes", () => {
    const buildRouteGraphSpy = vi.spyOn(graphLib, "buildRouteGraph");
    renderHook(() => useRoute(data));
    expect(buildRouteGraphSpy).toHaveBeenCalledTimes(1);

    act(() => {
      useAppStore.getState().setAccessibleOnly(true);
    });
    expect(buildRouteGraphSpy).toHaveBeenCalledTimes(2);
  });

  it("excludes an inaccessible edge from the route once accessibleOnly is on", () => {
    const { result } = renderHook(() => useRoute(data));

    act(() => {
      useAppStore.getState().setOrigin("node-a");
    });
    act(() => {
      useAppStore.getState().setDestination("node-c");
    });
    expect(result.current.route).not.toBeNull();

    act(() => {
      useAppStore.getState().setAccessibleOnly(true);
    });
    // edge-bc (the only path to node-c) is not accessible, so no route exists.
    expect(result.current.route).toBeNull();
  });
});
