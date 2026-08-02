import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MapZoomControls } from "@/features/map-viewer/components/MapZoomControls";
import { useAppStore } from "@/store";

const handlers = {
  onResetView: vi.fn(),
  onToggleGrid: vi.fn(),
  onZoomChange: vi.fn(),
};

beforeEach(() => {
  useAppStore.setState({ viewportZoom: 1 });
  vi.clearAllMocks();
});

afterEach(cleanup);

describe("MapZoomControls", () => {
  it("combines zoom, grid, reset, and the live zoom readout in one responsive island", () => {
    render(<MapZoomControls {...handlers} showGrid={false} />);

    const controls = screen.getByRole("group", { name: "Map view controls" });
    expect(controls.className).toContain("items-center");
    expect(controls.className).not.toContain("flex-col");
    expect(screen.getByText("100%")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Reset map view" }).className).not.toContain("hidden");

    fireEvent.click(screen.getByRole("button", { name: "Zoom out" }));
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    fireEvent.click(screen.getByRole("button", { name: "Reset map view" }));
    fireEvent.click(screen.getByRole("button", { name: "Toggle grid" }));

    expect(handlers.onZoomChange).toHaveBeenNthCalledWith(1, "out");
    expect(handlers.onZoomChange).toHaveBeenNthCalledWith(2, "in");
    expect(handlers.onResetView).toHaveBeenCalledOnce();
    expect(handlers.onToggleGrid).toHaveBeenCalledOnce();
  });

  it("updates only its own zoom readout when viewport zoom changes", () => {
    render(<MapZoomControls {...handlers} showGrid={false} />);

    act(() => {
      useAppStore.setState({ viewportZoom: 1.5 });
    });

    expect(screen.getByText("150%")).toBeTruthy();
  });
});
