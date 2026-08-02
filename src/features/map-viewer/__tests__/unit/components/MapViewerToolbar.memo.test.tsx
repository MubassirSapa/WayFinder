import { useState } from "react";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MapViewerToolbar } from "@/features/map-viewer/components/MapViewerToolbar";
import * as mapViewerViewportLib from "@/features/map-viewer/lib/mapViewerViewport";
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

// segments.length <= 1 forces the plain-label branch (not the breadcrumb
// branch), which calls formatFloorLabel unconditionally on every render —
// a reliable proxy for "did this component's body actually execute again".
const stableHandlers = {
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
  it("does not re-render when the parent re-renders with referentially unchanged props", () => {
    const formatSpy = vi.spyOn(mapViewerViewportLib, "formatFloorLabel");

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
    expect(formatSpy).toHaveBeenCalledTimes(1);

    act(() => {
      getByRole("button", { name: /tick/ }).click();
    });
    act(() => {
      getByRole("button", { name: /tick/ }).click();
    });

    expect(getByRole("button", { name: /tick/ }).textContent).toBe("tick: 2");
    expect(formatSpy).toHaveBeenCalledTimes(1);
  });

  it("still re-renders when showGrid changes, proving memo isn't over-suppressing updates", () => {
    const formatSpy = vi.spyOn(mapViewerViewportLib, "formatFloorLabel");

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
    expect(formatSpy).toHaveBeenCalledTimes(1);

    act(() => {
      getByRole("button", { name: /toggle/ }).click();
    });

    expect(formatSpy).toHaveBeenCalledTimes(2);
  });
});
