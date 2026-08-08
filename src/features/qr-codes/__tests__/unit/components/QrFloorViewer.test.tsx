import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { QrFloorViewer } from "@/features/qr-codes/components/QrFloorViewer";
import type { MapViewerData } from "@/features/map-viewer/types/map-viewer.types";

vi.mock("@/features/map-viewer/components/MapViewerCanvas", () => ({
  MapViewerCanvas: () => <div data-testid="map-viewer-canvas" />,
}));

vi.mock("@/features/map-viewer/hooks/useMapViewerViewport", () => ({
  useMapViewerViewport: () => ({
    consumeSuppressedClick: () => false,
    contentRef: { current: null },
    handleSvgPointerDown: vi.fn(),
    handleSvgPointerMove: vi.fn(),
    handleSvgPointerUp: vi.fn(),
    handleViewportPointerCancel: vi.fn(),
    handleViewportPointerLeave: vi.fn(),
    handleViewportPointerUp: vi.fn(),
    viewportRef: { current: null },
  }),
}));

const data: MapViewerData = {
  edgesByFloorId: {},
  floors: [
    {
      id: "floor-1",
      buildingId: "building-1",
      organizationName: null,
      name: "Ground Floor",
      level: 0,
      width: 1000,
      height: 1000,
      status: "published",
    },
  ],
  initialFloorId: "floor-1",
  nodesByFloorId: {},
  objectsByFloorId: {},
};

function mockScreenWidth(matches: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({ matches }) as unknown as typeof window.matchMedia;
}

function mockShellBottom(bottom: number, innerHeight: number) {
  Element.prototype.getBoundingClientRect = vi
    .fn()
    .mockReturnValue({ bottom } as DOMRect) as unknown as typeof Element.prototype.getBoundingClientRect;
  Object.defineProperty(window, "innerHeight", { configurable: true, value: innerHeight });
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("QrFloorViewer auto-scroll", () => {
  it("scrolls the shell into view when it's cut off on a large screen", () => {
    mockScreenWidth(true);
    mockShellBottom(900, 700);
    const scrollIntoViewMock = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;

    render(<QrFloorViewer data={data} />);

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth", block: "end" });
  });

  it("doesn't scroll when the shell already fully fits on screen", () => {
    mockScreenWidth(true);
    mockShellBottom(600, 700);
    const scrollIntoViewMock = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;

    render(<QrFloorViewer data={data} />);

    expect(scrollIntoViewMock).not.toHaveBeenCalled();
  });

  it("doesn't scroll below the large-screen breakpoint even if cut off", () => {
    mockScreenWidth(false);
    mockShellBottom(900, 700);
    const scrollIntoViewMock = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;

    render(<QrFloorViewer data={data} />);

    expect(scrollIntoViewMock).not.toHaveBeenCalled();
  });
});
