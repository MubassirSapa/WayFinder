import { useState } from "react";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MapViewerSvg } from "@/features/map-viewer/components/MapViewerSvg";
import * as mapViewerViewportLib from "@/features/map-viewer/lib/mapViewerViewport";
import type { ViewerFloor } from "@/features/map-viewer/types/map-viewer.types";

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

// Stable across every render of the harness below — a real component tree
// (MapViewerCanvas -> Shell) only recreates these when its own props change,
// not on every pan/zoom-driven re-render of the canvas itself.
const stableProps = {
  connectorTargetsByNodeId: {},
  edges: [],
  nodes: [],
  objects: [],
  onBackgroundClick: vi.fn(),
  onConnectorActivate: vi.fn(),
  onObjectPan: vi.fn(),
  onObjectSelect: vi.fn(),
  onPointerDown: vi.fn(),
  onPointerMove: vi.fn(),
  onPointerUp: vi.fn(),
  showGrid: false,
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("MapViewerSvg memoization", () => {
  it("does not re-render when the parent re-renders with referentially unchanged props", () => {
    // getRenderedFloorSize runs unconditionally at the top of MapViewerSvg's
    // body, so its call count is a direct proxy for "did this component's
    // function actually execute again".
    const getRenderedFloorSizeSpy = vi.spyOn(mapViewerViewportLib, "getRenderedFloorSize");

    function Harness() {
      const [tick, setTick] = useState(0);

      return (
        <div>
          <button onClick={() => setTick((current) => current + 1)} type="button">
            tick: {tick}
          </button>
          <MapViewerSvg activeFloor={activeFloor} selectedObjectId={null} {...stableProps} />
        </div>
      );
    }

    const { getByRole } = render(<Harness />);
    expect(getRenderedFloorSizeSpy).toHaveBeenCalledTimes(1);

    act(() => {
      getByRole("button").click();
    });
    act(() => {
      getByRole("button").click();
    });

    // The harness re-rendered twice (visible in the button's own label), but
    // MapViewerSvg's props never changed, so memo should have skipped it both times.
    expect(getByRole("button").textContent).toBe("tick: 2");
    expect(getRenderedFloorSizeSpy).toHaveBeenCalledTimes(1);
  });

  it("still re-renders when a real prop changes, proving memo isn't over-suppressing updates", () => {
    const getRenderedFloorSizeSpy = vi.spyOn(mapViewerViewportLib, "getRenderedFloorSize");

    function Harness() {
      const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

      return (
        <div>
          <button onClick={() => setSelectedObjectId("object-1")} type="button">
            select
          </button>
          <MapViewerSvg activeFloor={activeFloor} selectedObjectId={selectedObjectId} {...stableProps} />
        </div>
      );
    }

    const { getByRole } = render(<Harness />);
    expect(getRenderedFloorSizeSpy).toHaveBeenCalledTimes(1);

    act(() => {
      getByRole("button").click();
    });

    expect(getRenderedFloorSizeSpy).toHaveBeenCalledTimes(2);
  });
});
