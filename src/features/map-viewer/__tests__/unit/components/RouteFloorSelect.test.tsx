import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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

afterEach(cleanup);

describe("RouteFloorSelect", () => {
  it("shows the active floor and its position without rendering an unbounded breadcrumb", () => {
    render(
      <RouteFloorSelect
        activeSegmentIndex={3}
        floors={floors}
        onClearRoute={vi.fn()}
        onJumpToSegment={vi.fn()}
        segments={segments}
      />,
    );

    const trigger = screen.getByRole("combobox", {
      name: "Route floors, Floor 4, stop 4 of 8",
    });
    expect(trigger).toBeTruthy();
    expect(screen.getByText("Floor 4")).toBeTruthy();
    expect(screen.getByText("4/8")).toBeTruthy();
    expect(screen.queryByRole("navigation")).toBeNull();
  });

  it("opens a viewport-bounded scrollable list containing every route floor", async () => {
    render(
      <RouteFloorSelect
        activeSegmentIndex={0}
        floors={floors}
        onClearRoute={vi.fn()}
        onJumpToSegment={vi.fn()}
        segments={segments}
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));

    const listbox = await screen.findByRole("listbox");
    const popup = listbox.closest('[data-slot="select-content"]');
    expect(popup?.className).toContain("max-h-72");
    expect(popup?.getAttribute("data-align-trigger")).toBe("false");
    expect(screen.getAllByRole("option")).toHaveLength(8);
    expect(screen.getByText("Route starts here")).toBeTruthy();
    expect(screen.getAllByText("via stairs").length).toBeGreaterThan(0);
    expect(screen.getAllByText("via elevator").length).toBeGreaterThan(0);
  });

  it("jumps to the selected route segment", async () => {
    const onJumpToSegment = vi.fn();
    render(
      <RouteFloorSelect
        activeSegmentIndex={0}
        floors={floors}
        onClearRoute={vi.fn()}
        onJumpToSegment={onJumpToSegment}
        segments={segments}
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    const option = await screen.findByRole("option", { name: /Floor 7/ });
    fireEvent.pointerDown(option);
    fireEvent.pointerUp(option);
    fireEvent.click(option);

    expect(onJumpToSegment).toHaveBeenCalledWith(6);
  });

  it("cancels navigation from the floating floor control", () => {
    const onClearRoute = vi.fn();
    render(
      <RouteFloorSelect
        activeSegmentIndex={0}
        floors={floors}
        onClearRoute={onClearRoute}
        onJumpToSegment={vi.fn()}
        segments={segments}
      />,
    );

    expect(screen.getByRole("button", { name: "No previous route floor" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: "Go up to Floor 2" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Cancel navigation" }));
    expect(onClearRoute).toHaveBeenCalledOnce();
  });

  it("moves between route floors with one-tap direction arrows", () => {
    const onJumpToSegment = vi.fn();
    const { rerender } = render(
      <RouteFloorSelect
        activeSegmentIndex={3}
        floors={floors}
        onClearRoute={vi.fn()}
        onJumpToSegment={onJumpToSegment}
        segments={segments}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Go down to Floor 3" }));
    fireEvent.click(screen.getByRole("button", { name: "Go up to Floor 5" }));
    expect(onJumpToSegment).toHaveBeenNthCalledWith(1, 2);
    expect(onJumpToSegment).toHaveBeenNthCalledWith(2, 4);

    rerender(
      <RouteFloorSelect
        activeSegmentIndex={7}
        floors={floors}
        onClearRoute={vi.fn()}
        onJumpToSegment={onJumpToSegment}
        segments={segments}
      />,
    );
    expect(screen.getByRole("button", { name: "No next route floor" }).hasAttribute("disabled")).toBe(true);
  });
});
