import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FloorNavigator } from "@/features/map-viewer/components/FloorNavigator";
import type { ViewerFloor } from "@/features/map-viewer/types/map-viewer.types";

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

describe("FloorNavigator", () => {
  it("shows the active floor's plain level number, with its neighbors above and below", () => {
    render(<FloorNavigator activeFloor={floors[3]} floors={floors} onFloorChange={vi.fn()} />);

    expect(screen.getByRole("group", { name: "Floor navigation" })).toBeTruthy();
    expect(screen.getByRole("status").textContent).toBe("4");
    expect(screen.getByRole("button", { name: "3" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "4" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: "5" })).toBeTruthy();
    expect(screen.queryByText("Floor 4")).toBeNull();

    // Mimics a real building: a higher floor stacks above a lower one, not
    // list/array order — so 5 (higher) renders before 4, which renders
    // before 3 (lower), top to bottom.
    const rows = screen.getByRole("group", { name: "Floor navigation" }).querySelectorAll("button");
    expect(Array.from(rows).map((row) => row.textContent)).toEqual(["5", "4", "3"]);
  });

  it("jumps to the tapped neighbor floor", () => {
    vi.useFakeTimers();
    const onFloorChange = vi.fn();
    render(<FloorNavigator activeFloor={floors[3]} floors={floors} onFloorChange={onFloorChange} />);

    act(() => {
      screen.getByRole("button", { name: "5" }).click();
    });
    commitPendingSlide();
    expect(onFloorChange).toHaveBeenCalledWith("floor-5");

    act(() => {
      screen.getByRole("button", { name: "3" }).click();
    });
    commitPendingSlide();
    expect(onFloorChange).toHaveBeenCalledWith("floor-3");
  });

  it("moves between floors with the desktop-only up/down arrows", () => {
    vi.useFakeTimers();
    const onFloorChange = vi.fn();
    render(<FloorNavigator activeFloor={floors[3]} floors={floors} onFloorChange={onFloorChange} />);

    act(() => {
      screen.getByRole("button", { name: "Go to 5" }).click();
    });
    commitPendingSlide();
    expect(onFloorChange).toHaveBeenCalledWith("floor-5");

    act(() => {
      screen.getByRole("button", { name: "Go to 3" }).click();
    });
    commitPendingSlide();
    expect(onFloorChange).toHaveBeenCalledWith("floor-3");
  });

  it("disables navigation beyond the building's floor boundaries", () => {
    const { rerender } = render(
      <FloorNavigator activeFloor={floors[0]} floors={floors} onFloorChange={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: "No more floors" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: "Go to 2" }).hasAttribute("disabled")).toBe(false);

    rerender(<FloorNavigator activeFloor={floors[7]} floors={floors} onFloorChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Go to 7" }).hasAttribute("disabled")).toBe(false);
    expect(screen.getByRole("button", { name: "No more floors" }).hasAttribute("disabled")).toBe(true);
  });
});
