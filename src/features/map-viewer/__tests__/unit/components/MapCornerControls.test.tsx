import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MapCornerControls } from "@/features/map-viewer/components/MapCornerControls";

describe("MapCornerControls", () => {
  it("keeps left and right islands in separate shrinking grid columns above the mobile sidebar", () => {
    render(
      <MapCornerControls
        floorControls={<button type="button">Floors</button>}
        zoomControls={<button type="button">Zoom</button>}
      />,
    );

    const dock = screen.getByTestId("map-corner-controls");
    expect(dock.className).toContain("grid-cols-[minmax(0,1fr)_auto]");
    expect(dock.className).toContain("gap-2");
    expect(dock.className).toContain("bottom-20");
    expect(dock.className).toContain("md:bottom-4");
    expect(screen.getByRole("button", { name: "Floors" }).parentElement?.className).toContain("min-w-0");
    expect(screen.getByRole("button", { name: "Zoom" })).toBeTruthy();
  });
});
