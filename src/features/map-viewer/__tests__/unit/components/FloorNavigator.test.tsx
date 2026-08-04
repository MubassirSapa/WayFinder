import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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

afterEach(cleanup);

describe("FloorNavigator", () => {
  it("shows the active floor, building position, and adjacent-floor actions", () => {
    const onFloorChange = vi.fn();
    render(
      <FloorNavigator
        activeFloor={floors[3]}
        floors={floors}
        onFloorChange={onFloorChange}
      />,
    );

    expect(screen.getByRole("group", { name: "Floor navigation" })).toBeTruthy();
    const navigator = screen.getByRole("group", { name: "Floor navigation" });
    const selector = screen.getByRole("combobox", { name: "Switch floor, Floor 4, 4 of 8" });
    expect(navigator.className).toContain("w-fit");
    expect(navigator.className).toContain("gap-0.5");
    expect(selector.className).toContain("w-16");
    expect(selector.className).not.toContain("flex-1");
    expect(screen.queryByText("4 of 8")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Go down to Floor 3" }));
    fireEvent.click(screen.getByRole("button", { name: "Go up to Floor 5" }));

    expect(onFloorChange).toHaveBeenNthCalledWith(1, "floor-3");
    expect(onFloorChange).toHaveBeenNthCalledWith(2, "floor-5");
  });

  it("disables navigation beyond the building's floor boundaries", () => {
    const { rerender } = render(
      <FloorNavigator activeFloor={floors[0]} floors={floors} onFloorChange={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: "No lower floor" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: "Go up to Floor 2" }).hasAttribute("disabled")).toBe(false);

    rerender(
      <FloorNavigator activeFloor={floors[7]} floors={floors} onFloorChange={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: "Go down to Floor 7" }).hasAttribute("disabled")).toBe(false);
    expect(screen.getByRole("button", { name: "No higher floor" }).hasAttribute("disabled")).toBe(true);
  });

  it("keeps long building lists in a bounded popup and switches to a selected floor", async () => {
    const onFloorChange = vi.fn();
    render(
      <FloorNavigator activeFloor={floors[0]} floors={floors} onFloorChange={onFloorChange} />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    const listbox = await screen.findByRole("listbox");
    const popup = listbox.closest('[data-slot="select-content"]');
    expect(popup?.className).toContain("max-h-72");
    expect(popup?.getAttribute("data-align-trigger")).toBe("false");
    expect(screen.getAllByRole("option")).toHaveLength(8);

    const option = screen.getByRole("option", { name: /Floor 7/ });
    fireEvent.pointerDown(option);
    fireEvent.pointerUp(option);
    fireEvent.click(option);

    expect(onFloorChange).toHaveBeenCalledWith("floor-7");
  });
});
