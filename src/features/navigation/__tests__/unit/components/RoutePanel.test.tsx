import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RoutePanel } from "@/features/navigation/components/RoutePanel";
import type { ViewerFloor, ViewerMapNode, ViewerMapObject } from "@/features/map-viewer/types/map-viewer.types";
import { useAppStore } from "@/store";

const floor: ViewerFloor = {
  buildingId: "building-1",
  height: 600,
  id: "floor-1",
  level: 1,
  name: "First Floor",
  organizationName: null,
  status: "published",
  width: 800,
};

const objects: ViewerMapObject[] = [
  { buildingId: "building-1", floorId: floor.id, height: 40, id: "start-object", isAccessible: true, isSearchable: true, label: "Main Entrance", name: "Main Entrance", parentObjectId: null, rotation: 0, shape: "rectangle", type: "exit", width: 40, x: 10, y: 10 },
  { buildingId: "building-1", floorId: floor.id, height: 40, id: "end-object", isAccessible: true, isSearchable: true, label: "Room 101", name: "Room 101", parentObjectId: null, rotation: 0, shape: "rectangle", type: "room", width: 40, x: 100, y: 100 },
];

const nodes: ViewerMapNode[] = [
  { buildingId: "building-1", floorId: floor.id, geometryType: "icon", id: "start-node", isAccessible: true, label: "Start", objectId: objects[0].id, role: "entrance", x: 20, y: 20 },
  { buildingId: "building-1", floorId: floor.id, geometryType: "icon", id: "end-node", isAccessible: true, label: "End", objectId: objects[1].id, role: "hallway_point", x: 120, y: 120 },
];

afterEach(() => {
  cleanup();
  useAppStore.setState({ activeSegmentIndex: 0, destinationNodeId: null, originNodeId: null });
});

describe("RoutePanel", () => {
  it("shows explicit endpoints and clears navigation from the panel header", () => {
    useAppStore.setState({ destinationNodeId: "end-node", originNodeId: "start-node" });
    render(
      <RoutePanel
        activeSegmentIndex={0}
        effectiveOriginId="start-node"
        floors={[floor]}
        graph={new Map()}
        nodes={nodes}
        onJumpToSegment={vi.fn()}
        route={{ edgeIds: ["edge-1"], nodeIds: ["start-node", "end-node"], totalDistanceMeters: 12 }}
        searchableObjects={objects}
        segments={[{ edgeIds: ["edge-1"], floorId: floor.id, nodeIds: ["start-node", "end-node"] }]}
      />,
    );

    // Endpoints are shown once, via the "Get directions" fields themselves -
    // no separate Start/Destination summary card duplicating the same names.
    expect(screen.getByDisplayValue("Main Entrance")).toBeTruthy();
    expect(screen.getByDisplayValue("Room 101")).toBeTruthy();
    expect(screen.queryByText("Start")).toBeNull();
    expect(screen.queryByText("Destination")).toBeNull();
    expect(screen.getByText("12.0 m")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Clear navigation" }));
    expect(useAppStore.getState().originNodeId).toBeNull();
    expect(useAppStore.getState().destinationNodeId).toBeNull();
  });
});
