import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { MapViewerSvg } from "@/features/map-viewer/components/MapViewerSvg";
import type {
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
  floorId: "floor-2",
  floorName: "Upper Floor",
  targetNode: { ...stairsNode, id: "node-stairs-upper", floorId: "floor-2" },
};

function renderSvg({
  objects,
  nodes = [],
  connectorTargetsByNodeId = {},
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
