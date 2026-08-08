import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { MapSelectionBar } from "@/features/navigation/components/MapSelectionBar";

afterEach(cleanup);

describe("MapSelectionBar positioning", () => {
  it("keeps room navigation close to the top edge", () => {
    render(
      <MapSelectionBar
        floors={[]}
        label="Room 101"
        nodeId={null}
        nodes={[]}
        onClose={() => undefined}
        searchableObjects={[]}
      />,
    );

    const bar = screen.getByText("Room 101").closest('[class*="top-3"]');
    expect(bar).toBeTruthy();
    expect(bar?.className).not.toContain("top-16");
  });
});
