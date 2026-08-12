import { useState } from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { MapViewerShell } from "@/features/map-viewer/components/MapViewerShell";
import * as mapStylesLib from "@/features/map-viewer/lib/mapStyles";
import type {
  MapViewerData,
  ViewerFloor,
  ViewerMapNode,
  ViewerMapObject,
  ViewerPathEdge,
} from "@/features/map-viewer/types/map-viewer.types";
import { useAppStore } from "@/store";

// This test exists specifically to answer "does the useCallback fix in
// MapViewerShell actually help at the scale the bug was reported at" - the
// existing MapViewerSvg.memo.test.tsx only proves memo() itself works with 0
// objects/nodes and already-stable vi.fn() props; it doesn't render the real
// MapViewerShell, so it never exercised the actual bug (Shell recreating
// onBackgroundClick/onObjectSelect/onConnectorActivate on every render).

const router = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("nextjs-toploader/app", () => ({ useRouter: () => router }));
vi.mock("next/navigation", () => ({ usePathname: () => "/map/floor-1" }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

beforeAll(() => {
  (globalThis as typeof globalThis & { ResizeObserver?: unknown }).ResizeObserver ??= class {
    disconnect() {}
    observe() {}
    unobserve() {}
  };

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
  vi.restoreAllMocks();
  router.replace.mockClear();
  useAppStore.setState({
    accessibleOnly: false,
    activeFloorId: null,
    activeSegmentIndex: 0,
    destinationNodeId: null,
    isRouteSearchOpen: false,
    originNodeId: null,
  });
});

const FLOOR: ViewerFloor = {
  id: "floor-1",
  buildingId: "building-k",
  buildingName: "Building K",
  organizationName: "Seneca",
  name: "Level 3",
  level: 3,
  width: 4000,
  height: 3000,
  status: "published",
};

const ROOM_COUNT = 30;
const objects: ViewerMapObject[] = Array.from({ length: ROOM_COUNT }, (_, i) => ({
  id: `room-${i}`,
  floorId: FLOOR.id,
  buildingId: FLOOR.buildingId,
  parentObjectId: null,
  type: "room",
  name: `Room ${i}`,
  label: `Room ${i}`,
  x: (i % 6) * 150,
  y: Math.floor(i / 6) * 120,
  width: 120,
  height: 90,
  rotation: 0,
  shape: "rectangle",
  isSearchable: true,
  isAccessible: true,
}));

const NODE_COUNT = 100;
const nodes: ViewerMapNode[] = Array.from({ length: NODE_COUNT }, (_, i) => ({
  id: `node-${i}`,
  floorId: FLOOR.id,
  buildingId: FLOOR.buildingId,
  objectId: null,
  role: "hallway_point",
  label: "",
  x: (i % 20) * 60,
  y: Math.floor(i / 20) * 60 + 800,
  geometryType: "icon",
  isAccessible: true,
}));

// A chain (99 edges) plus a handful of cross-links - comfortably over 100
// edges, same as the node count, matching the reported floor's scale.
const edges: ViewerPathEdge[] = [
  ...Array.from({ length: NODE_COUNT - 1 }, (_, i) => ({
    id: `edge-${i}`,
    floorId: FLOOR.id,
    buildingId: FLOOR.buildingId,
    fromNodeId: `node-${i}`,
    toNodeId: `node-${i + 1}`,
    type: "walkway" as const,
    distanceMeters: 5,
    bidirectional: true,
    isAccessible: true,
  })),
  ...Array.from({ length: 6 }, (_, i) => ({
    id: `cross-edge-${i}`,
    floorId: FLOOR.id,
    buildingId: FLOOR.buildingId,
    fromNodeId: `node-${i * 10}`,
    toNodeId: `node-${i * 10 + 40}`,
    type: "walkway" as const,
    distanceMeters: 8,
    bidirectional: true,
    isAccessible: true,
  })),
];

const data: MapViewerData = {
  edgesByFloorId: { [FLOOR.id]: edges },
  floors: [FLOOR],
  initialFloorId: FLOOR.id,
  nodesByFloorId: { [FLOOR.id]: nodes },
  objectsByFloorId: { [FLOOR.id]: objects },
};

describe("MapViewerShell memoization at realistic scale (30 rooms, 100+ nodes/edges)", () => {
  it("does not re-render MapViewerSvg's object/node/edge tree when Shell re-renders for an unrelated reason", () => {
    // getViewerObjectPalette is called once per rendered object, exclusively
    // inside MapViewerSvg's own object-mapping loop - unlike
    // getRenderedFloorSize (MapViewerSvg.memo.test.tsx's proxy), which
    // MapViewerCanvas (unmemoized, re-renders unconditionally with Shell)
    // *also* calls, so it can't tell "Canvas re-rendered" apart from
    // "MapViewerSvg's memo failed to skip". This one only fires when
    // MapViewerSvg's body genuinely re-executes.
    const spy = vi.spyOn(mapStylesLib, "getViewerObjectPalette");

    // MapViewerShell itself isn't memoized (only MapViewerSvg inside it is),
    // so a parent re-render always re-executes Shell's body - same as any
    // real re-render trigger (a store update Shell subscribes to, a parent
    // route change, etc). `data` stays the exact same reference across
    // ticks, matching a real app: only Shell's *own* state changed, nothing
    // about the floor's data did.
    function Harness() {
      const [tick, setTick] = useState(0);
      return (
        <div>
          <button onClick={() => setTick((current) => current + 1)} type="button">
            tick: {tick}
          </button>
          <MapViewerShell data={data} />
        </div>
      );
    }

    render(<Harness />);

    // Initial mount render, plus the floor-init effect (resetNavigation +
    // setActiveFloorId) triggering one re-render - both legitimate.
    const callsAfterMount = spy.mock.calls.length;
    expect(callsAfterMount).toBeGreaterThan(0);

    // Selecting Room 0 is exactly the kind of interaction the bug report
    // described ("tapping around for a few minutes") - it's a real prop
    // change (selectedObjectId) the first time, so MapViewerSvg legitimately
    // re-renders once here.
    act(() => {
      screen.getByText("Room 0").closest("g")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    const callsAfterFirstSelect = spy.mock.calls.length;
    expect(callsAfterFirstSelect).toBeGreaterThan(callsAfterMount);

    // Now force two more Shell re-renders that have nothing to do with the
    // map itself. Before the fix, MapViewerShell recreated
    // onBackgroundClick/onObjectSelect/onConnectorActivate on *every* one of
    // its own renders regardless of cause, so each of these would have
    // forced a full re-render of all 30 rooms/100 nodes/100+ edges for no
    // visual reason. After the fix, memo() should skip both.
    act(() => {
      screen.getByRole("button", { name: /tick/ }).click();
    });
    act(() => {
      screen.getByRole("button", { name: /tick/ }).click();
    });

    expect(screen.getByRole("button", { name: /tick/ }).textContent).toBe("tick: 2");
    expect(spy.mock.calls.length).toBe(callsAfterFirstSelect);
  });
});
