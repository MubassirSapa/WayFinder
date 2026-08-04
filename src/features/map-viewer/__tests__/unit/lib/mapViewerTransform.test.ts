import { describe, expect, it } from "vitest";

import { buildPanZoomTransform } from "../../../lib/mapViewerTransform";

describe("buildPanZoomTransform", () => {
  it("builds a translate + scale transform string from pan and zoom", () => {
    expect(buildPanZoomTransform({ x: 10, y: -5 }, 1.5)).toBe("translate(10px, -5px) scale(1.5)");
  });

  it("matches the exact string MapViewerCanvas's inline style used before extraction, for zero-pan/zoom-1", () => {
    expect(buildPanZoomTransform({ x: 0, y: 0 }, 1)).toBe("translate(0px, 0px) scale(1)");
  });

  it("handles fractional and negative values without rounding", () => {
    expect(buildPanZoomTransform({ x: -123.456, y: 78.9 }, 0.734)).toBe(
      "translate(-123.456px, 78.9px) scale(0.734)",
    );
  });
});
