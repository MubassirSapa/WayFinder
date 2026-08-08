import { useState } from "react";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MapViewerToolbar } from "@/features/map-viewer/components/MapViewerToolbar";
import * as libUtils from "@/lib/utils";
import type { ViewerFloor } from "@/features/map-viewer/types/map-viewer.types";
import type { RouteFloorSegment } from "@/features/navigation/types/navigation.types";

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
const floors = [activeFloor];
// Hoisted so it's the SAME reference across every render — an inline `[]`
// literal in JSX is a fresh array each render, which alone would defeat
// memo regardless of what this test is trying to prove.
const emptySegments: RouteFloorSegment[] = [];

// segments.length <= 1 renders FloorNavigator -> FloorWheel, which calls
// cn() to build its className on every render - a stable proxy for "did
// this subtree's render body actually execute," unlike React's Profiler,
// whose onRender fires once per commit regardless of whether a memoized
// child bailed out.
const stableHandlers = {
  onFloorChange: vi.fn(),
  onJumpToSegment: vi.fn(),
  onResetView: vi.fn(),
  onToggleGrid: vi.fn(),
  onZoomChange: vi.fn(),
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("MapViewerToolbar memoization", () => {
  it("positions map controls bottom-left and floor navigation bottom-right", () => {
    const { getByRole } = render(
      <MapViewerToolbar
        activeFloor={activeFloor}
        activeSegmentIndex={0}
        floors={floors}
        segments={emptySegments}
        showGrid={false}
        {...stableHandlers}
      />,
    );

    const cornerDock = getByRole("group", { name: "Floor navigation" }).closest('[data-testid="map-corner-controls"]');
    expect(cornerDock?.className).toContain("bottom-4");
    expect(cornerDock?.className).toContain("inset-x-3");
    expect(cornerDock?.className).toContain("grid-cols-[auto_minmax(0,1fr)]");
    expect(getByRole("group", { name: "Map view controls" })).toBeTruthy();
  });

  it("does not re-render when the parent re-renders with referentially unchanged props", () => {
    const cnSpy = vi.spyOn(libUtils, "cn");

    function Harness() {
      const [tick, setTick] = useState(0);
      return (
        <div>
          <button onClick={() => setTick((current) => current + 1)} type="button">
            tick: {tick}
          </button>
          <MapViewerToolbar
            activeFloor={activeFloor}
            activeSegmentIndex={0}
            floors={floors}
            segments={emptySegments}
            showGrid={false}
            {...stableHandlers}
          />
        </div>
      );
    }

    const { getByRole } = render(<Harness />);
    const callsAfterMount = cnSpy.mock.calls.length;
    expect(callsAfterMount).toBeGreaterThan(0);

    act(() => {
      getByRole("button", { name: /tick/ }).click();
    });
    act(() => {
      getByRole("button", { name: /tick/ }).click();
    });

    expect(getByRole("button", { name: /tick/ }).textContent).toBe("tick: 2");
    expect(cnSpy.mock.calls.length).toBe(callsAfterMount);
  });

  it("still re-renders when showGrid changes, proving memo isn't over-suppressing updates", () => {
    const cnSpy = vi.spyOn(libUtils, "cn");

    function Harness() {
      const [showGrid, setShowGrid] = useState(false);
      return (
        <div>
          <button onClick={() => setShowGrid((current) => !current)} type="button">
            toggle
          </button>
          <MapViewerToolbar
            activeFloor={activeFloor}
            activeSegmentIndex={0}
            floors={floors}
            segments={emptySegments}
            showGrid={showGrid}
            {...stableHandlers}
          />
        </div>
      );
    }

    const { getByRole } = render(<Harness />);
    const callsAfterMount = cnSpy.mock.calls.length;

    act(() => {
      getByRole("button", { name: /toggle/ }).click();
    });

    expect(cnSpy.mock.calls.length).toBeGreaterThan(callsAfterMount);
  });
});
