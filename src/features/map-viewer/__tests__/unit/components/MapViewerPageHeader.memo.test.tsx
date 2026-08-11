import { useState } from "react";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MapViewerPageHeader } from "@/features/map-viewer/components/MapViewerPageHeader";
import * as mapViewerViewportLib from "@/features/map-viewer/lib/mapViewerViewport";
import type { ViewerFloor } from "@/features/map-viewer/types/map-viewer.types";

// buildingName omitted (optional field) forces the `?? formatIdAsTitle(...)`
// fallback on every render, making that call a reliable proxy for "did this
// component's body actually execute again".
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
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("MapViewerPageHeader memoization", () => {
  it("does not re-render when the parent re-renders with referentially unchanged props", () => {
    const formatSpy = vi.spyOn(mapViewerViewportLib, "formatIdAsTitle");
    function Harness() {
      const [tick, setTick] = useState(0);
      return (
        <div>
          <button onClick={() => setTick((current) => current + 1)} type="button">
            tick: {tick}
          </button>
          <MapViewerPageHeader activeFloor={activeFloor} />
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

  it("still re-renders when activeFloor changes, proving memo isn't over-suppressing updates", () => {
    const formatSpy = vi.spyOn(mapViewerViewportLib, "formatIdAsTitle");
    const otherFloor: ViewerFloor = { ...activeFloor, id: "floor-2", name: "Upper Floor" };
    function Harness() {
      const [floor, setFloor] = useState(activeFloor);
      return (
        <div>
          <button onClick={() => setFloor(otherFloor)} type="button">
            switch
          </button>
          <MapViewerPageHeader activeFloor={floor} />
        </div>
      );
    }

    const { getByRole } = render(<Harness />);
    expect(formatSpy).toHaveBeenCalledTimes(1);

    act(() => {
      getByRole("button", { name: /switch/ }).click();
    });

    expect(formatSpy).toHaveBeenCalledTimes(2);
  });

  it("shows floor context without duplicating the canvas floor selector", () => {
    const { queryByRole, getByText } = render(<MapViewerPageHeader activeFloor={activeFloor} />);

    expect(getByText("Ground Floor")).toBeTruthy();
    expect(queryByRole("combobox")).toBeNull();
  });

  it("shows the building's name, not the organization's", () => {
    const floorWithBuildingName: ViewerFloor = {
      ...activeFloor,
      buildingName: "West Wing",
      organizationName: "Acme University",
    };
    const { getByText, queryByText } = render(<MapViewerPageHeader activeFloor={floorWithBuildingName} />);

    expect(getByText("West Wing")).toBeTruthy();
    expect(queryByText("Acme University")).toBeNull();
  });

  it("falls back to a title-cased building id when the building has no name", () => {
    const floorWithoutBuildingName: ViewerFloor = {
      ...activeFloor,
      buildingId: "west-wing",
      buildingName: null,
    };
    const { getByText } = render(<MapViewerPageHeader activeFloor={floorWithoutBuildingName} />);

    expect(getByText("West Wing")).toBeTruthy();
  });
});
