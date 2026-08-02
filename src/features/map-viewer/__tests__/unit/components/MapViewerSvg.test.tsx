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
  routeConnectorDirection = null,
  routeConnectorNodeId = null,
  onObjectPan = vi.fn(),
  onObjectSelect = vi.fn(),
  onConnectorActivate = vi.fn(),
}: {
  connectorTargetsByNodeId?: Record<string, ConnectorTargetInfo[]>;
  nodes?: ViewerMapNode[];
  objects: ViewerMapObject[];
  onConnectorActivate?: ReturnType<typeof vi.fn>;
  onObjectPan?: ReturnType<typeof vi.fn>;
  onObjectSelect?: ReturnType<typeof vi.fn>;
  routeConnectorDirection?: ConnectorDirection | null;
  routeConnectorNodeId?: string | null;
}) {
  render(
    <MapViewerSvg
      activeFloor={activeFloor}
      connectorTargetsByNodeId={connectorTargetsByNodeId}
      edges={[]}
      nodes={nodes}
      objects={objects}
      onBackgroundClick={vi.fn()}
      onConnectorActivate={onConnectorActivate}
      onObjectPan={onObjectPan}
      onObjectSelect={onObjectSelect}
      onPointerDown={vi.fn()}
      onPointerMove={vi.fn()}
      onPointerUp={vi.fn()}
      routeConnectorDirection={routeConnectorDirection}
      routeConnectorNodeId={routeConnectorNodeId}
      routePoints={undefined}
      selectedObjectId={null}
      showGrid={false}
    />,
  );

  return { onConnectorActivate, onObjectPan, onObjectSelect };
}

function getObjectGroup(label: string) {
  return screen.getByText(label).closest("g") as SVGGElement;
}

describe("MapViewerSvg object drag vs. click", () => {
  it("selects the object on a plain press with no movement", () => {
    const { onObjectPan, onObjectSelect } = renderSvg({ objects: [roomObject] });
    const group = getObjectGroup("Room A");

    fireEvent.pointerDown(group, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerUp(group, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.click(group);

    expect(onObjectSelect).toHaveBeenCalledTimes(1);
    expect(onObjectSelect).toHaveBeenCalledWith(roomObject);
    expect(onObjectPan).not.toHaveBeenCalled();
  });

  it("treats sub-threshold jitter as a click, not a drag", () => {
    const { onObjectPan, onObjectSelect } = renderSvg({ objects: [roomObject] });
    const group = getObjectGroup("Room A");

    fireEvent.pointerDown(group, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(group, { clientX: 103, clientY: 101, movementX: 3, movementY: 1, pointerId: 1 });
    fireEvent.pointerUp(group, { clientX: 103, clientY: 101, pointerId: 1 });
    fireEvent.click(group);

    expect(onObjectPan).not.toHaveBeenCalled();
    expect(onObjectSelect).toHaveBeenCalledTimes(1);
  });

  it("pans without selecting once the drag threshold is crossed", () => {
    const { onObjectPan, onObjectSelect } = renderSvg({ objects: [roomObject] });
    const group = getObjectGroup("Room A");

    fireEvent.pointerDown(group, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(group, { clientX: 110, clientY: 100, movementX: 10, movementY: 0, pointerId: 1 });
    fireEvent.pointerUp(group, { clientX: 110, clientY: 100, pointerId: 1 });
    fireEvent.click(group);

    expect(onObjectPan).toHaveBeenCalledWith(10, 0);
    expect(onObjectSelect).not.toHaveBeenCalled();
  });

  it("keeps forwarding pan deltas for every move after the threshold is crossed", () => {
    const { onObjectPan } = renderSvg({ objects: [roomObject] });
    const group = getObjectGroup("Room A");

    fireEvent.pointerDown(group, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(group, { clientX: 110, clientY: 100, movementX: 10, movementY: 0, pointerId: 1 });
    fireEvent.pointerMove(group, { clientX: 112, clientY: 101, movementX: 2, movementY: 1, pointerId: 1 });
    fireEvent.pointerUp(group, { clientX: 112, clientY: 101, pointerId: 1 });

    expect(onObjectPan).toHaveBeenNthCalledWith(1, 10, 0);
    expect(onObjectPan).toHaveBeenNthCalledWith(2, 2, 1);
  });

  it("resets drag state on pointer cancel so a later plain click still selects", () => {
    const { onObjectPan, onObjectSelect } = renderSvg({ objects: [roomObject] });
    const group = getObjectGroup("Room A");

    fireEvent.pointerDown(group, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(group, { clientX: 110, clientY: 100, movementX: 10, movementY: 0, pointerId: 1 });
    fireEvent.pointerCancel(group, { pointerId: 1 });

    fireEvent.pointerDown(group, { clientX: 200, clientY: 200, pointerId: 2 });
    fireEvent.pointerUp(group, { clientX: 200, clientY: 200, pointerId: 2 });
    fireEvent.click(group);

    expect(onObjectSelect).toHaveBeenCalledTimes(1);
    expect(onObjectPan).toHaveBeenCalledTimes(1);
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
    const { onConnectorActivate, onObjectPan, onObjectSelect } = renderSvg({
      objects: [stairsObject],
      nodes: [stairsNode],
      connectorTargetsByNodeId: { [stairsNode.id]: [stairsTarget] },
    });
    const group = getObjectGroup("Stairs A");

    fireEvent.pointerDown(group, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(group, { clientX: 110, clientY: 100, movementX: 10, movementY: 0, pointerId: 1 });
    fireEvent.pointerUp(group, { clientX: 110, clientY: 100, pointerId: 1 });
    fireEvent.click(group);

    expect(onObjectPan).toHaveBeenCalledWith(10, 0);
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
        edges={[]}
        nodes={[stairsNode]}
        objects={[stairsObject]}
        onBackgroundClick={vi.fn()}
        onConnectorActivate={vi.fn()}
        onObjectPan={vi.fn()}
        onObjectSelect={vi.fn()}
        onPointerDown={vi.fn()}
        onPointerMove={vi.fn()}
        onPointerUp={vi.fn()}
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
