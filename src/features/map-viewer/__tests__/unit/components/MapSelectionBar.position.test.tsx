import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { MapSelectionBar } from "@/features/navigation/components/MapSelectionBar";

afterEach(cleanup);

describe("MapSelectionBar positioning", () => {
  it("keeps room navigation close to the top edge", () => {
    render(<MapSelectionBar label="Room 101" nodeId={null} onClose={() => undefined} />);

    const bar = screen.getByText("Room 101").parentElement?.parentElement;
    expect(bar?.className).toContain("top-3");
    expect(bar?.className).not.toContain("top-16");
  });
});
