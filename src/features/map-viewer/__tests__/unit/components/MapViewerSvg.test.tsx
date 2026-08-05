import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { MapViewerSvg } from "@/features/map-viewer/components/MapViewerSvg";
import type {
  ConnectorDirection,
  ConnectorTargetInfo,
  ViewerFloor,
  ViewerMapNode,
  ViewerMapObject,
} from "@/features/map-viewer/types/map-viewer.types";

// jsdom doesn't implement pointer capture at all (no-op the calls the
// component makes) — without this, setPointerCapture/hasPointerCapture throw
// "not a function" the moment a pointerdown/pointerup fires in a test.
beforeAll(() => {
  const proto = Element.prototype as unknown as {
    hasPointerCapture?: () => boolean;
    releasePointerCapture?: () => void;
    setPointerCapture?: () => void;
  };
  proto.setPointerCapture ??= () => {};
  proto.releasePointerCapture ??= () => {};
  proto.hasPointerCapture ??= () => false;
});

afterEach(() => {
  cleanup();
});

const activeFloor: ViewerFloor = {
  id: "floor-1",
  buildingId: "building-1",
  organizationName: null,
  name: "Ground Floor",
  level: 0,
  width: 400,
  height: 300,
  status: "published",
};

const roomObject: ViewerMapObject = {
  id: "object-room",
  floorId: "floor-1",
  buildingId: "building-1",
  parentObjectId: null,
  type: "room",
  name: "Room A",
  label: "Room A",
  x: 20,
  y: 20,
  width: 120,
  height: 80,
  rotation: 0,
  shape: "rectangle",
  isSearchable: true,
  isAccessible: true,
};

const stairsObject: ViewerMapObject = {
  ...roomObject,
  id: "object-stairs",
  type: "stairs",
  name: "Stairs A",
  label: "Stairs A",
  x: 200,
  y: 20,
};

const stairsNode: ViewerMapNode = {
  id: "node-stairs",
  floorId: "floor-1",
  buildingId: "building-1",
  objectId: "object-stairs",
  role: "stairs_entry",
  label: "Stairs A Marker",
  x: 260,
  y: 60,
  geometryType: "icon",
  isAccessible: true,
};

const stairsTarget: ConnectorTargetInfo = {
  direction: "up",
  floorId: "floor-2",
  floorName: "Upper Floor",
  targetNode: { ...stairsNode, id: "node-stairs-upper", floorId: "floor-2" },
};

function renderSvg({
  objects,
  nodes = [],
  connectorTargetsByNodeId = {},
  destinationObjectId = null,
  originObjectId = null,
  routeConnectorDirection = null,
  routeConnectorNodeId = null,
  routeHasDestination,
  routeHasStart,
  routePoints,
  onObjectSelect = vi.fn(),
  onConnectorActivate = vi.fn(),
  onViewportPointerDown = vi.fn(),
  onViewportPointerMove = vi.fn(),
  onViewportPointerUp = vi.fn(),
}: {
  connectorTargetsByNodeId?: Record<string, ConnectorTargetInfo[]>;
  destinationObjectId?: string | null;
  nodes?: ViewerMapNode[];
  objects: ViewerMapObject[];
  onConnectorActivate?: ReturnType<typeof vi.fn>;
  onObjectSelect?: ReturnType<typeof vi.fn>;
  onViewportPointerDown?: ReturnType<typeof vi.fn>;
  onViewportPointerMove?: ReturnType<typeof vi.fn>;
  onViewportPointerUp?: ReturnType<typeof vi.fn>;
  originObjectId?: string | null;
  routeConnectorDirection?: ConnectorDirection | null;
  routeConnectorNodeId?: string | null;
  routeHasDestination?: boolean;
  routeHasStart?: boolean;
  routePoints?: { x: number; y: number }[];
}) {
  render(
    <MapViewerSvg
      activeFloor={activeFloor}
      connectorTargetsByNodeId={connectorTargetsByNodeId}
      destinationObjectId={destinationObjectId}
      edges={[]}
      nodes={nodes}
      objects={objects}
      onBackgroundClick={vi.fn()}
      onConnectorActivate={onConnectorActivate}
      onObjectSelect={onObjectSelect}
      onPointerDown={onViewportPointerDown}
      onPointerMove={onViewportPointerMove}
      onPointerUp={onViewportPointerUp}
      originObjectId={originObjectId}
      routeConnectorDirection={routeConnectorDirection}
      routeConnectorNodeId={routeConnectorNodeId}
      routeHasDestination={routeHasDestination}
      routeHasStart={routeHasStart}
      routePoints={routePoints}
      selectedObjectId={null}
      showGrid={false}
    />,
  );

  return {
    onConnectorActivate,
    onObjectSelect,
    onViewportPointerDown,
    onViewportPointerMove,
    onViewportPointerUp,
  };
}

function getObjectGroup(label: string) {
  return screen.getByText(label).closest("g") as SVGGElement;
}

describe("MapViewerSvg object drag vs. click", () => {
  it("selects the object on a plain press with no movement", () => {
    const { onObjectSelect, onViewportPointerDown, onViewportPointerMove, onViewportPointerUp } = renderSvg({ objects: [roomObject] });
    const group = getObjectGroup("Room A");

    fireEvent.pointerDown(group, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerUp(group, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.click(group);

    expect(onObjectSelect).toHaveBeenCalledTimes(1);
    expect(onObjectSelect).toHaveBeenCalledWith(roomObject);
    expect(onViewportPointerDown).toHaveBeenCalledTimes(1);
    expect(onViewportPointerMove).not.toHaveBeenCalled();
    expect(onViewportPointerUp).toHaveBeenCalledTimes(1);
  });

  it("treats sub-threshold jitter as a click, not a drag", () => {
    const { onObjectSelect, onViewportPointerMove } = renderSvg({ objects: [roomObject] });
    const group = getObjectGroup("Room A");

    fireEvent.pointerDown(group, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(group, { clientX: 103, clientY: 101, movementX: 3, movementY: 1, pointerId: 1 });
    fireEvent.pointerUp(group, { clientX: 103, clientY: 101, pointerId: 1 });
    fireEvent.click(group);

    expect(onViewportPointerMove).toHaveBeenCalledTimes(1);
    expect(onObjectSelect).toHaveBeenCalledTimes(1);
  });

  it("pans without selecting once the drag threshold is crossed", () => {
    const { onObjectSelect, onViewportPointerMove } = renderSvg({ objects: [roomObject] });
    const group = getObjectGroup("Room A");

    fireEvent.pointerDown(group, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(group, { clientX: 110, clientY: 100, movementX: 10, movementY: 0, pointerId: 1 });
    fireEvent.pointerUp(group, { clientX: 110, clientY: 100, pointerId: 1 });
    fireEvent.click(group);

    expect(onViewportPointerMove).toHaveBeenCalledTimes(1);
    expect(onObjectSelect).not.toHaveBeenCalled();
  });

  it("keeps forwarding pan deltas for every move after the threshold is crossed", () => {
    const { onViewportPointerMove } = renderSvg({ objects: [roomObject] });
    const group = getObjectGroup("Room A");

    fireEvent.pointerDown(group, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(group, { clientX: 110, clientY: 100, movementX: 10, movementY: 0, pointerId: 1 });
    fireEvent.pointerMove(group, { clientX: 112, clientY: 101, movementX: 2, movementY: 1, pointerId: 1 });
    fireEvent.pointerUp(group, { clientX: 112, clientY: 101, pointerId: 1 });

    expect(onViewportPointerMove).toHaveBeenCalledTimes(2);
  });

  it("forwards both touch pointers from a room to viewport pinch handling without selecting", () => {
    const {
      onObjectSelect,
      onViewportPointerDown,
      onViewportPointerMove,
      onViewportPointerUp,
    } = renderSvg({ objects: [roomObject] });
    const group = getObjectGroup("Room A");

    fireEvent.pointerDown(group, { clientX: 100, clientY: 100, pointerId: 1, pointerType: "touch" });
    fireEvent.pointerDown(group, { clientX: 200, clientY: 100, pointerId: 2, pointerType: "touch" });
    fireEvent.pointerMove(group, { clientX: 250, clientY: 100, pointerId: 2, pointerType: "touch" });
    fireEvent.pointerUp(group, { clientX: 250, clientY: 100, pointerId: 2, pointerType: "touch" });
    fireEvent.pointerUp(group, { clientX: 100, clientY: 100, pointerId: 1, pointerType: "touch" });
    fireEvent.click(group);

    expect(onViewportPointerDown).toHaveBeenCalledTimes(2);
    expect(onViewportPointerMove).toHaveBeenCalledTimes(1);
    expect(onViewportPointerUp).toHaveBeenCalledTimes(2);
    expect(onObjectSelect).not.toHaveBeenCalled();
  });

  it("resets drag state on pointer cancel so a later plain click still selects", () => {
    const { onObjectSelect, onViewportPointerMove } = renderSvg({ objects: [roomObject] });
    const group = getObjectGroup("Room A");

    fireEvent.pointerDown(group, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(group, { clientX: 110, clientY: 100, movementX: 10, movementY: 0, pointerId: 1 });
    fireEvent.pointerCancel(group, { pointerId: 1 });

    fireEvent.pointerDown(group, { clientX: 200, clientY: 200, pointerId: 2 });
    fireEvent.pointerUp(group, { clientX: 200, clientY: 200, pointerId: 2 });
    fireEvent.click(group);

    expect(onObjectSelect).toHaveBeenCalledTimes(1);
    expect(onViewportPointerMove).toHaveBeenCalledTimes(1);
  });
});

describe("MapViewerSvg route endpoints", () => {
  it("labels only the real route start and destination", () => {
    const { rerender } = render(
      <MapViewerSvg
        activeFloor={activeFloor}
        connectorTargetsByNodeId={{}}
        destinationObjectId={null}
        edges={[]}
        nodes={[]}
        objects={[]}
        onBackgroundClick={vi.fn()}
        onConnectorActivate={vi.fn()}
        onObjectSelect={vi.fn()}
        onPointerDown={vi.fn()}
        onPointerMove={vi.fn()}
        onPointerUp={vi.fn()}
        originObjectId={null}
        routeConnectorDirection={null}
        routeConnectorNodeId={null}
        routeHasStart
        routePoints={[{ x: 20, y: 20 }, { x: 80, y: 80 }]}
        selectedObjectId={null}
        showGrid={false}
      />,
    );

    expect(screen.getByRole("img", { name: "Route start" })).toBeTruthy();
    expect(screen.queryByRole("img", { name: "Route destination" })).toBeNull();

    rerender(
      <MapViewerSvg
        activeFloor={activeFloor}
        connectorTargetsByNodeId={{}}
        destinationObjectId={null}
        edges={[]}
        nodes={[]}
        objects={[]}
        onBackgroundClick={vi.fn()}
        onConnectorActivate={vi.fn()}
        onObjectSelect={vi.fn()}
        onPointerDown={vi.fn()}
        onPointerMove={vi.fn()}
        onPointerUp={vi.fn()}
        originObjectId={null}
        routeConnectorDirection={null}
        routeConnectorNodeId={null}
        routeHasDestination
        routePoints={[{ x: 20, y: 20 }, { x: 80, y: 80 }]}
        selectedObjectId={null}
        showGrid={false}
      />,
    );

    expect(screen.queryByRole("img", { name: "Route start" })).toBeNull();
    expect(screen.getByRole("img", { name: "Route destination" })).toBeTruthy();
  });
});

describe("MapViewerSvg origin/destination object badges", () => {
  it("badges the origin object as the starting point when no route is drawn yet", () => {
    renderSvg({ objects: [roomObject], originObjectId: roomObject.id });

    expect(screen.getByRole("img", { name: "Selected as starting point" })).toBeTruthy();
    expect(screen.queryByRole("img", { name: "Selected as destination" })).toBeNull();
  });

  it("badges the destination object once it's chosen", () => {
    renderSvg({ objects: [roomObject], destinationObjectId: roomObject.id });

    expect(screen.getByRole("img", { name: "Selected as destination" })).toBeTruthy();
    expect(screen.queryByRole("img", { name: "Selected as starting point" })).toBeNull();
  });

  it("hides the origin badge once the route polyline's own start marker takes over on this floor", () => {
    renderSvg({
      objects: [roomObject],
      originObjectId: roomObject.id,
      routeHasStart: true,
      routePoints: [{ x: 20, y: 20 }, { x: 80, y: 80 }],
    });

    expect(screen.queryByRole("img", { name: "Selected as starting point" })).toBeNull();
    expect(screen.getByRole("img", { name: "Route start" })).toBeTruthy();
  });

  it("hides the destination badge once the route polyline's own destination marker takes over on this floor", () => {
    renderSvg({
      objects: [roomObject],
      destinationObjectId: roomObject.id,
      routeHasDestination: true,
      routePoints: [{ x: 20, y: 20 }, { x: 80, y: 80 }],
    });

    expect(screen.queryByRole("img", { name: "Selected as destination" })).toBeNull();
    expect(screen.getByRole("img", { name: "Route destination" })).toBeTruthy();
  });

  it("keeps the origin badge when a route exists but its start marker isn't on this floor/segment", () => {
    renderSvg({
      objects: [roomObject],
      originObjectId: roomObject.id,
      routeHasStart: false,
      routePoints: [{ x: 20, y: 20 }, { x: 80, y: 80 }],
    });

    expect(screen.getByRole("img", { name: "Selected as starting point" })).toBeTruthy();
  });
});

describe("MapViewerSvg connector objects", () => {
  it("selects a connector on the first click without activating the floor jump", () => {
    const { onConnectorActivate, onObjectSelect } = renderSvg({
      objects: [stairsObject],
      nodes: [stairsNode],
      connectorTargetsByNodeId: { [stairsNode.id]: [stairsTarget] },
    });
    const group = getObjectGroup("Stairs A");

    fireEvent.pointerDown(group, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerUp(group, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.click(group);

    expect(onObjectSelect).toHaveBeenCalledWith(stairsObject);
    expect(onConnectorActivate).not.toHaveBeenCalled();
  });

  it("activates the floor jump on a second quick click, still selecting each time", () => {
    const { onConnectorActivate, onObjectSelect } = renderSvg({
      objects: [stairsObject],
      nodes: [stairsNode],
      connectorTargetsByNodeId: { [stairsNode.id]: [stairsTarget] },
    });
    const group = getObjectGroup("Stairs A");

    fireEvent.pointerDown(group, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerUp(group, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.click(group);

    fireEvent.pointerDown(group, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerUp(group, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.click(group);

    expect(onObjectSelect).toHaveBeenCalledTimes(2);
    expect(onConnectorActivate).toHaveBeenCalledTimes(1);
    expect(onConnectorActivate).toHaveBeenCalledWith(stairsNode, [stairsTarget]);
  });

  it("suppresses both selection and the floor-jump press when the gesture was a drag", () => {
    const { onConnectorActivate, onObjectSelect, onViewportPointerMove } = renderSvg({
      objects: [stairsObject],
      nodes: [stairsNode],
      connectorTargetsByNodeId: { [stairsNode.id]: [stairsTarget] },
    });
    const group = getObjectGroup("Stairs A");

    fireEvent.pointerDown(group, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(group, { clientX: 110, clientY: 100, movementX: 10, movementY: 0, pointerId: 1 });
    fireEvent.pointerUp(group, { clientX: 110, clientY: 100, pointerId: 1 });
    fireEvent.click(group);

    expect(onViewportPointerMove).toHaveBeenCalledTimes(1);
    expect(onObjectSelect).not.toHaveBeenCalled();
    expect(onConnectorActivate).not.toHaveBeenCalled();
  });
});

describe("MapViewerSvg route-connector highlight", () => {
  it("outlines the connector's object shape in the route color when it's the segment's exit connector", () => {
    renderSvg({
      objects: [stairsObject],
      nodes: [stairsNode],
      routeConnectorNodeId: stairsNode.id,
    });

    const group = getObjectGroup("Stairs A");
    const shape = group.querySelector("rect, polygon, ellipse") as SVGElement;
    expect(shape.getAttribute("stroke")).toBe("var(--map-viewer-route-line)");
    expect(shape.getAttribute("stroke-width")).toBe("2.4");
  });

  it("adds a pulsing beacon ring on the connector's node marker", () => {
    renderSvg({
      objects: [stairsObject],
      nodes: [stairsNode],
      routeConnectorNodeId: stairsNode.id,
    });

    const beacon = document.querySelector(".animate-\\[wf-pulse_1\\.6s_ease-out_infinite\\]");
    expect(beacon).toBeTruthy();
    expect(beacon?.getAttribute("fill")).toBe("var(--map-viewer-route-line)");
  });

  it("leaves other objects and connectors unstyled when they're not the route's exit connector", () => {
    renderSvg({
      objects: [roomObject, stairsObject],
      nodes: [stairsNode],
      routeConnectorNodeId: "some-other-node-id",
    });

    const roomShape = getObjectGroup("Room A").querySelector("rect, polygon, ellipse") as SVGElement;
    const stairsShape = getObjectGroup("Stairs A").querySelector("rect, polygon, ellipse") as SVGElement;
    expect(roomShape.getAttribute("stroke")).not.toBe("var(--map-viewer-route-line)");
    expect(stairsShape.getAttribute("stroke")).not.toBe("var(--map-viewer-route-line)");
    expect(document.querySelector(".animate-\\[wf-pulse_1\\.6s_ease-out_infinite\\]")).toBeNull();
  });

  it("lets an explicit selection still take visual priority over the route highlight", () => {
    render(
      <MapViewerSvg
        activeFloor={activeFloor}
        connectorTargetsByNodeId={{}}
        destinationObjectId={null}
        edges={[]}
        nodes={[stairsNode]}
        objects={[stairsObject]}
        onBackgroundClick={vi.fn()}
        onConnectorActivate={vi.fn()}
        onObjectSelect={vi.fn()}
        onPointerDown={vi.fn()}
        onPointerMove={vi.fn()}
        onPointerUp={vi.fn()}
        originObjectId={null}
        routeConnectorDirection="up"
        routeConnectorNodeId={stairsNode.id}
        routePoints={undefined}
        selectedObjectId={stairsObject.id}
        showGrid={false}
      />,
    );

    const shape = getObjectGroup("Stairs A").querySelector("rect, polygon, ellipse") as SVGElement;
    expect(shape.getAttribute("stroke")).toBe("var(--primary)");
  });
});

const stairsTargetDown: ConnectorTargetInfo = {
  direction: "down",
  floorId: "floor-0",
  floorName: "Lower Floor",
  targetNode: { ...stairsNode, id: "node-stairs-lower", floorId: "floor-0" },
};

const UP_BADGE_PATH = "M0,-3.5 L2.8,1.5 L-2.8,1.5 Z";
const DOWN_BADGE_PATH = "M0,3.5 L2.8,-1.5 L-2.8,-1.5 Z";

describe("MapViewerSvg connector direction badge", () => {
  it("shows only the up triangle for a connector with a single up target", () => {
    renderSvg({
      objects: [stairsObject],
      nodes: [stairsNode],
      connectorTargetsByNodeId: { [stairsNode.id]: [stairsTarget] },
    });

    expect(document.querySelector(`path[d="${UP_BADGE_PATH}"]`)).toBeTruthy();
    expect(document.querySelector(`path[d="${DOWN_BADGE_PATH}"]`)).toBeNull();
  });

  it("shows only the down triangle for a connector with a single down target", () => {
    renderSvg({
      objects: [stairsObject],
      nodes: [stairsNode],
      connectorTargetsByNodeId: { [stairsNode.id]: [stairsTargetDown] },
    });

    expect(document.querySelector(`path[d="${DOWN_BADGE_PATH}"]`)).toBeTruthy();
    expect(document.querySelector(`path[d="${UP_BADGE_PATH}"]`)).toBeNull();
  });

  it("shows both triangles for a connector that goes both up and down", () => {
    renderSvg({
      objects: [stairsObject],
      nodes: [stairsNode],
      connectorTargetsByNodeId: { [stairsNode.id]: [stairsTarget, stairsTargetDown] },
    });

    expect(document.querySelector(`path[d="${UP_BADGE_PATH}"]`)).toBeTruthy();
    expect(document.querySelector(`path[d="${DOWN_BADGE_PATH}"]`)).toBeTruthy();
  });

  it("shows no badge for a connector with no cross-floor targets", () => {
    renderSvg({ objects: [stairsObject], nodes: [stairsNode] });

    expect(document.querySelector(`path[d="${UP_BADGE_PATH}"]`)).toBeNull();
    expect(document.querySelector(`path[d="${DOWN_BADGE_PATH}"]`)).toBeNull();
  });

  it("uses the route's own direction for the highlighted connector, even when the connector also serves the opposite direction", () => {
    renderSvg({
      objects: [stairsObject],
      nodes: [stairsNode],
      connectorTargetsByNodeId: { [stairsNode.id]: [stairsTarget, stairsTargetDown] },
      routeConnectorDirection: "down",
      routeConnectorNodeId: stairsNode.id,
    });

    // The connector serves both directions, but this specific route continues
    // down — the badge should reflect that, not the generic "both" summary.
    expect(document.querySelector(`path[d="${DOWN_BADGE_PATH}"]`)).toBeTruthy();
    expect(document.querySelector(`path[d="${UP_BADGE_PATH}"]`)).toBeNull();
  });

  it("shows a second direction triangle inside the double-press hint for a single-target connector", () => {
    renderSvg({
      objects: [stairsObject],
      nodes: [stairsNode],
      connectorTargetsByNodeId: { [stairsNode.id]: [stairsTarget] },
    });

    // One "up" triangle already from the persistent per-marker badge.
    expect(document.querySelectorAll(`path[d="${UP_BADGE_PATH}"]`).length).toBe(1);

    const group = getObjectGroup("Stairs A");
    fireEvent.pointerDown(group, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerUp(group, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.click(group);

    expect(screen.getByText("Tap again for Upper Floor")).toBeTruthy();
    // A second "up" triangle appears inside the hint itself while pending.
    expect(document.querySelectorAll(`path[d="${UP_BADGE_PATH}"]`).length).toBe(2);
  });
});
