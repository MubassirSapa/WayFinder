import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { useMapViewerViewportGestures } from "@/features/map-viewer/hooks/useMapViewerViewportGestures";
import type { ViewerFloor } from "@/features/map-viewer/types/map-viewer.types";
import { useAppStore } from "@/store";

// jsdom doesn't implement pointer capture at all — without this, the
// gesture handlers' setPointerCapture/hasPointerCapture calls throw.
beforeAll(() => {
  const proto = Element.prototype as unknown as {
    hasPointerCapture?: () => boolean;
    releasePointerCapture?: () => void;
    setPointerCapture?: () => void;
  };
  proto.setPointerCapture ??= () => {};
  proto.releasePointerCapture ??= () => {};
  proto.hasPointerCapture ??= () => false;
});

// Small enough that every pan/zoom this suite exercises stays well inside
// clampPanToViewport's overscroll margin — isolates the gesture math under
// test from the separate (already covered) clamping behavior.
const activeFloor: ViewerFloor = {
  id: "floor-1",
  buildingId: "building-1",
  organizationName: null,
  name: "Ground Floor",
  level: 0,
  width: 200,
  height: 150,
  status: "published",
};
const viewportSize = { x: 1000, y: 800 };

const INITIAL_VIEWPORT_STATE = {
  isViewportDragging: false,
  viewportPan: { x: 0, y: 0 },
  viewportZoom: 1,
};

interface FakePointerEventInit {
  clientX: number;
  clientY: number;
  pointerId: number;
  button?: number;
  pointerType?: string;
}

function makeEvent(target: Element, init: FakePointerEventInit) {
  return {
    button: init.button ?? 0,
    clientX: init.clientX,
    clientY: init.clientY,
    currentTarget: target,
    pointerId: init.pointerId,
    pointerType: init.pointerType ?? "mouse",
  } as unknown as React.PointerEvent<SVGSVGElement>;
}

describe("useMapViewerViewportGestures", () => {
  let viewportEl: HTMLDivElement;
  let contentEl: HTMLDivElement;
  let svgEl: SVGSVGElement;

  beforeEach(() => {
    useAppStore.setState(INITIAL_VIEWPORT_STATE);

    viewportEl = document.createElement("div");
    document.body.appendChild(viewportEl);
    vi.spyOn(viewportEl, "getBoundingClientRect").mockReturnValue({
      bottom: 800,
      height: 800,
      left: 0,
      right: 1000,
      top: 0,
      width: 1000,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    contentEl = document.createElement("div");
    svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg") as unknown as SVGSVGElement;
  });

  afterEach(() => {
    viewportEl.remove();
    useAppStore.setState(INITIAL_VIEWPORT_STATE);
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  function setup() {
    const viewportRef = { current: viewportEl };
    const { result } = renderHook(() =>
      useMapViewerViewportGestures({ activeFloor, viewportRef, viewportSize }),
    );

    act(() => {
      result.current.contentRef.current = contentEl;
    });

    return result;
  }

  it("applies the drag transform to the DOM immediately, ahead of any store commit", () => {
    const result = setup();

    act(() => {
      result.current.handleSvgPointerDown(makeEvent(svgEl, { clientX: 100, clientY: 100, pointerId: 1 }));
    });
    expect(useAppStore.getState().isViewportDragging).toBe(true);

    act(() => {
      result.current.handleSvgPointerMove(makeEvent(svgEl, { clientX: 130, clientY: 100, pointerId: 1 }));
    });

    expect(contentEl.style.transform).toBe("translate(30px, 0px) scale(1)");
    // Not committed yet — commits are throttled to at most once per frame.
    expect(useAppStore.getState().viewportPan).toEqual({ x: 0, y: 0 });
  });

  it("flushes the pending pan to the store synchronously on pointer up", () => {
    const result = setup();

    act(() => {
      result.current.handleSvgPointerDown(makeEvent(svgEl, { clientX: 100, clientY: 100, pointerId: 1 }));
    });
    act(() => {
      result.current.handleSvgPointerMove(makeEvent(svgEl, { clientX: 130, clientY: 100, pointerId: 1 }));
    });
    act(() => {
      result.current.handleSvgPointerUp(makeEvent(svgEl, { clientX: 130, clientY: 100, pointerId: 1 }));
    });

    expect(useAppStore.getState().viewportPan).toEqual({ x: 30, y: 0 });
    expect(useAppStore.getState().isViewportDragging).toBe(false);
  });

  it("does not flag a sub-threshold move as a drag, so the click is not suppressed", () => {
    const result = setup();

    act(() => {
      result.current.handleSvgPointerDown(makeEvent(svgEl, { clientX: 100, clientY: 100, pointerId: 1 }));
    });
    act(() => {
      result.current.handleSvgPointerMove(makeEvent(svgEl, { clientX: 103, clientY: 101, pointerId: 1 }));
    });
    act(() => {
      result.current.handleSvgPointerUp(makeEvent(svgEl, { clientX: 103, clientY: 101, pointerId: 1 }));
    });

    expect(result.current.consumeSuppressedClick()).toBe(false);
  });

  it("flags a past-threshold move as a drag, so the next click is suppressed", () => {
    const result = setup();

    act(() => {
      result.current.handleSvgPointerDown(makeEvent(svgEl, { clientX: 100, clientY: 100, pointerId: 1 }));
    });
    act(() => {
      result.current.handleSvgPointerMove(makeEvent(svgEl, { clientX: 130, clientY: 100, pointerId: 1 }));
    });
    act(() => {
      result.current.handleSvgPointerUp(makeEvent(svgEl, { clientX: 130, clientY: 100, pointerId: 1 }));
    });

    expect(result.current.consumeSuppressedClick()).toBe(true);
    // Consuming resets it — a second read in the same tick must be false.
    expect(result.current.consumeSuppressedClick()).toBe(false);
  });

  it("pinch-zooms around the midpoint between two pointers and does not flag it as a background drag", () => {
    const result = setup();

    act(() => {
      result.current.handleSvgPointerDown(makeEvent(svgEl, { clientX: 100, clientY: 100, pointerId: 1 }));
    });
    act(() => {
      result.current.handleSvgPointerDown(makeEvent(svgEl, { clientX: 200, clientY: 100, pointerId: 2 }));
    });
    expect(useAppStore.getState().isViewportDragging).toBe(false);

    act(() => {
      result.current.handleSvgPointerMove(makeEvent(svgEl, { clientX: 250, clientY: 100, pointerId: 2 }));
    });

    // Distance grew from 100 to 150 -> zoom scales by 1.5x; pan recenters on
    // the moving midpoint so the pinch's world-space anchor stays put.
    expect(contentEl.style.transform).toBe("translate(-50px, -50px) scale(1.5)");
  });

  it("uses viewport-local pinch coordinates when the canvas is offset on a phone layout", () => {
    vi.mocked(viewportEl.getBoundingClientRect).mockReturnValue({
      bottom: 1000,
      height: 800,
      left: 80,
      right: 1080,
      top: 200,
      width: 1000,
      x: 80,
      y: 200,
      toJSON: () => ({}),
    });
    const result = setup();

    act(() => {
      result.current.handleSvgPointerDown(makeEvent(svgEl, {
        clientX: 180,
        clientY: 300,
        pointerId: 1,
        pointerType: "touch",
      }));
      result.current.handleSvgPointerDown(makeEvent(svgEl, {
        clientX: 280,
        clientY: 300,
        pointerId: 2,
        pointerType: "touch",
      }));
      result.current.handleSvgPointerMove(makeEvent(svgEl, {
        clientX: 330,
        clientY: 300,
        pointerId: 2,
        pointerType: "touch",
      }));
    });

    // Local points are still (100,100) and (250,100), so the map has the
    // same stable transform as a viewport positioned at window origin.
    expect(contentEl.style.transform).toBe("translate(-50px, -50px) scale(1.5)");
  });

  it("continues smoothly as one-finger pan when one pinch pointer lifts", () => {
    const result = setup();

    act(() => {
      result.current.handleSvgPointerDown(makeEvent(svgEl, { clientX: 100, clientY: 100, pointerId: 1, pointerType: "touch" }));
      result.current.handleSvgPointerDown(makeEvent(svgEl, { clientX: 200, clientY: 100, pointerId: 2, pointerType: "touch" }));
      result.current.handleSvgPointerMove(makeEvent(svgEl, { clientX: 250, clientY: 100, pointerId: 2, pointerType: "touch" }));
      result.current.handleSvgPointerUp(makeEvent(svgEl, { clientX: 250, clientY: 100, pointerId: 2, pointerType: "touch" }));
      result.current.handleSvgPointerMove(makeEvent(svgEl, { clientX: 120, clientY: 100, pointerId: 1, pointerType: "touch" }));
    });

    expect(contentEl.style.transform).toBe("translate(-30px, -50px) scale(1.5)");
    expect(useAppStore.getState().isViewportDragging).toBe(true);
  });

  it("keeps click suppression armed until the final pinch pointer is lifted", () => {
    vi.useFakeTimers();
    const result = setup();

    act(() => {
      result.current.handleSvgPointerDown(makeEvent(svgEl, { clientX: 100, clientY: 100, pointerId: 1, pointerType: "touch" }));
      result.current.handleSvgPointerDown(makeEvent(svgEl, { clientX: 200, clientY: 100, pointerId: 2, pointerType: "touch" }));
      result.current.handleSvgPointerMove(makeEvent(svgEl, { clientX: 250, clientY: 100, pointerId: 2, pointerType: "touch" }));
      result.current.handleSvgPointerUp(makeEvent(svgEl, { clientX: 250, clientY: 100, pointerId: 2, pointerType: "touch" }));
      vi.runOnlyPendingTimers();
      result.current.handleSvgPointerUp(makeEvent(svgEl, { clientX: 100, clientY: 100, pointerId: 1, pointerType: "touch" }));
    });

    expect(result.current.consumeSuppressedClick()).toBe(true);
    expect(result.current.consumeSuppressedClick()).toBe(false);
  });

  it("wheel-zooms around the cursor position when ctrlKey is set (pinch-to-zoom), applying the transform immediately", () => {
    const result = setup();
    void result;

    const wheelEvent = new WheelEvent("wheel", {
      cancelable: true,
      clientX: 100,
      clientY: 100,
      ctrlKey: true,
      deltaY: -100,
    });

    act(() => {
      viewportEl.dispatchEvent(wheelEvent);
    });

    expect(contentEl.style.transform).toBe("translate(-8px, -8px) scale(1.08)");
  });

  it("pans instead of zooming on a plain two-finger scroll (no ctrlKey)", () => {
    const result = setup();
    void result;

    const wheelEvent = new WheelEvent("wheel", {
      cancelable: true,
      deltaX: 20,
      deltaY: 15,
    });

    act(() => {
      viewportEl.dispatchEvent(wheelEvent);
    });

    expect(contentEl.style.transform).toBe("translate(-20px, -15px) scale(1)");
  });

  it("does not pan on wheel when there is no active floor to clamp against", () => {
    const viewportRef = { current: viewportEl };
    const { result } = renderHook(() =>
      useMapViewerViewportGestures({ activeFloor: null, viewportRef, viewportSize }),
    );
    act(() => {
      result.current.contentRef.current = contentEl;
    });

    const wheelEvent = new WheelEvent("wheel", { cancelable: true, deltaX: 20, deltaY: 15 });

    act(() => {
      viewportEl.dispatchEvent(wheelEvent);
    });

    expect(useAppStore.getState().viewportPan).toEqual({ x: 0, y: 0 });
  });
});
