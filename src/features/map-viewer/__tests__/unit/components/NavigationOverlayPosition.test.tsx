import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FloorHopIndicator } from "@/features/navigation/components/FloorHopIndicator";
import { RouteStatusIndicator } from "@/features/navigation/components/RouteStatusIndicator";

afterEach(cleanup);

describe("navigation overlay positioning", () => {
  it("keeps the floor-hop card in a row above the corner islands", () => {
    render(
      <FloorHopIndicator
        direction="up"
        edgeType="elevator"
        floorName="Floor 2"
        onAdvance={vi.fn()}
      />,
    );

    const positioner = screen.getByRole("button", { name: /Continue via elevator/ }).parentElement;
    expect(positioner?.className).toContain("bottom-36");
    expect(positioner?.className).toContain("md:bottom-20");
  });

  it("keeps route status in the same non-overlapping row", () => {
    render(<RouteStatusIndicator accessibleOnly={false} distanceMeters={12} found />);

    const positioner = screen.getByText("Your destination floor • 12.0 m").parentElement;
    expect(positioner?.className).toContain("bottom-36");
    expect(positioner?.className).toContain("md:bottom-20");
  });
});
