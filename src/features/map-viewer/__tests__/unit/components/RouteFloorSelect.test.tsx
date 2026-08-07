import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RouteFloorSelect } from "@/features/map-viewer/components/RouteFloorSelect";
import type { ViewerFloor } from "@/features/map-viewer/types/map-viewer.types";
import type { RouteFloorSegment } from "@/features/navigation/types/navigation.types";

const floors: ViewerFloor[] = Array.from({ length: 8 }, (_, index) => ({
  buildingId: "building-1",
  height: 800,
  id: `floor-${index + 1}`,
  level: index + 1,
  name: `Floor ${index + 1}`,
  organizationName: "Test Building",
  status: "published",
  width: 1200,
}));

const segments: RouteFloorSegment[] = floors.map((floor, index) => ({
  edgeIds: [],
  enterViaEdgeType: index === 0 ? undefined : index % 2 === 0 ? "elevator" : "stairs",
  floorId: floor.id,
  nodeIds: [`node-${index + 1}`],
}));

// The wheel commits a floor change after its slide-into-place animation
// finishes (FloorWheel's SLIDE_DURATION_MS), not on the same tick as the
// click - fake timers make that deterministic instead of racing a real
// 200ms setTimeout in the test.
function commitPendingSlide() {
  act(() => {
    vi.advanceTimersByTime(200);
  });
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("RouteFloorSelect", () => {
  it("shows the active floor's plain level number, never its name", () => {
    render(
      <RouteFloorSelect activeSegmentIndex={3} floors={floors} onJumpToSegment={vi.fn()} segments={segments} />,
    );

    expect(screen.getByRole("group", { name: "Route floor navigation" })).toBeTruthy();
    expect(screen.getByRole("status").textContent).toBe("4");
    expect(screen.getByRole("button", { name: "3" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "4" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: "5" })).toBeTruthy();
    expect(screen.queryByText("Floor 4")).toBeNull();
  });

  it("has no separate cancel-navigation control - clearing the route already lives in the Navigate panel", () => {
    render(
      <RouteFloorSelect activeSegmentIndex={0} floors={floors} onJumpToSegment={vi.fn()} segments={segments} />,
    );

    expect(screen.queryByRole("button", { name: "Cancel navigation" })).toBeNull();
  });

  it("jumps to the next floor when the faded row below is tapped", () => {
    vi.useFakeTimers();
    const onJumpToSegment = vi.fn();
    render(
      <RouteFloorSelect
        activeSegmentIndex={3}
        floors={floors}
        onJumpToSegment={onJumpToSegment}
        segments={segments}
      />,
    );

    act(() => {
      screen.getByRole("button", { name: "5" }).click();
    });
    commitPendingSlide();

    expect(onJumpToSegment).toHaveBeenCalledWith(4);
  });

  it("jumps to the previous floor when the faded row above is tapped", () => {
    vi.useFakeTimers();
    const onJumpToSegment = vi.fn();
    render(
      <RouteFloorSelect
        activeSegmentIndex={3}
        floors={floors}
        onJumpToSegment={onJumpToSegment}
        segments={segments}
      />,
    );

    act(() => {
      screen.getByRole("button", { name: "3" }).click();
    });
    commitPendingSlide();

    expect(onJumpToSegment).toHaveBeenCalledWith(2);
  });

  it("moves between route floors with the desktop-only up/down arrows", () => {
    vi.useFakeTimers();
    const onJumpToSegment = vi.fn();
    render(
      <RouteFloorSelect
        activeSegmentIndex={3}
        floors={floors}
        onJumpToSegment={onJumpToSegment}
        segments={segments}
      />,
    );

    act(() => {
      screen.getByRole("button", { name: "Go to 5" }).click();
    });
    commitPendingSlide();
    expect(onJumpToSegment).toHaveBeenCalledWith(4);

    act(() => {
      screen.getByRole("button", { name: "Go to 3" }).click();
    });
    commitPendingSlide();
    expect(onJumpToSegment).toHaveBeenCalledWith(2);
  });

  it("disables the arrow at either end of the route instead of wrapping around", () => {
    const { rerender } = render(
      <RouteFloorSelect activeSegmentIndex={0} floors={floors} onJumpToSegment={vi.fn()} segments={segments} />,
    );

    expect(screen.getByRole("button", { name: "No more floors" }).hasAttribute("disabled")).toBe(true);

    rerender(
      <RouteFloorSelect activeSegmentIndex={7} floors={floors} onJumpToSegment={vi.fn()} segments={segments} />,
    );

    expect(screen.getByRole("button", { name: "No more floors" }).hasAttribute("disabled")).toBe(true);
  });
});
