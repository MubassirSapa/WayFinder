import { useRef, useState } from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MapViewerCanvas } from "@/features/map-viewer/components/MapViewerCanvas";
import type { ViewerFloor } from "@/features/map-viewer/types/map-viewer.types";
import { useAppStore } from "@/store";

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

const INITIAL_VIEWPORT_STATE = {
  isViewportDragging: false,
  viewportPan: { x: 0, y: 0 },
  viewportZoom: 1,
};

function renderCanvas() {
  function Harness() {
    const viewportRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);

    return (
      <MapViewerCanvas
        activeFloor={activeFloor}
        connectorTargetsByNodeId={{}}
        destinationObjectId={null}
        contentRef={contentRef}
        edges={[]}
        nodes={[]}
        objects={[]}
        onBackgroundClick={vi.fn()}
        onConnectorActivate={vi.fn()}
        onObjectSelect={vi.fn()}
        onPointerCancel={vi.fn()}
        onPointerDown={vi.fn()}
        onPointerLeave={vi.fn()}
        onPointerMove={vi.fn()}
        onPointerUp={vi.fn()}
        originObjectId={null}
        routeConnectorDirection={null}
        routeConnectorNodeId={null}
        selectedObjectId={null}
        showGrid={false}
        viewportRef={viewportRef}
      />
    );
  }

  return render(<Harness />);
}

describe("MapViewerCanvas store subscription", () => {
  beforeEach(() => {
    useAppStore.setState(INITIAL_VIEWPORT_STATE);
  });

  afterEach(() => {
    cleanup();
    useAppStore.setState(INITIAL_VIEWPORT_STATE);
  });

  it("renders the transform from the store's committed pan/zoom", () => {
    useAppStore.setState({ viewportPan: { x: 42, y: -17 }, viewportZoom: 1.5 });

    renderCanvas();

    const contentNode = document.querySelector(".will-change-transform") as HTMLElement;
    expect(contentNode.style.transform).toBe("translate(42px, -17px) scale(1.5)");
  });

  it("re-renders with the new transform when the store's pan changes", () => {
    renderCanvas();

    act(() => {
      useAppStore.setState({ viewportPan: { x: 100, y: 200 } });
    });

    const contentNode = document.querySelector(".will-change-transform") as HTMLElement;
    expect(contentNode.style.transform).toBe("translate(100px, 200px) scale(1)");
  });

  it("reflects isViewportDragging as the grabbing cursor on the outer viewport", () => {
    renderCanvas();
    const viewportNode = document.querySelector(".cursor-grab, .cursor-grabbing") as HTMLElement;
    expect(viewportNode.className).toContain("cursor-grab");
    expect(viewportNode.className).not.toContain("cursor-grabbing");

    act(() => {
      useAppStore.setState({ isViewportDragging: true });
    });

    expect(viewportNode.className).toContain("cursor-grabbing");
  });
});

describe("MapViewerCanvas re-render isolation", () => {
  beforeEach(() => {
    useAppStore.setState(INITIAL_VIEWPORT_STATE);
  });

  afterEach(() => {
    cleanup();
    useAppStore.setState(INITIAL_VIEWPORT_STATE);
  });

  // The whole point of moving pan/zoom into the store: a component that
  // doesn't select viewportPan/viewportZoom must not re-render when they
  // change, even though it renders MapViewerCanvas (which does select them)
  // as a child. This is what stops a map drag from re-rendering the entire
  // page shell.
  it("does not re-render a parent that never selects viewport state, even though its child does", () => {
    let parentRenderCount = 0;

    function ShellStandIn() {
      parentRenderCount += 1;
      const [label] = useState("shell");
      const viewportRef = useRef<HTMLDivElement | null>(null);
      const contentRef = useRef<HTMLDivElement | null>(null);

      return (
        <div data-label={label}>
          <MapViewerCanvas
            activeFloor={activeFloor}
            connectorTargetsByNodeId={{}}
            destinationObjectId={null}
            contentRef={contentRef}
            edges={[]}
            nodes={[]}
            objects={[]}
            onBackgroundClick={vi.fn()}
            onConnectorActivate={vi.fn()}
            onObjectSelect={vi.fn()}
            onPointerCancel={vi.fn()}
            onPointerDown={vi.fn()}
            onPointerLeave={vi.fn()}
            onPointerMove={vi.fn()}
            onPointerUp={vi.fn()}
            originObjectId={null}
            routeConnectorDirection={null}
            routeConnectorNodeId={null}
            selectedObjectId={null}
            showGrid={false}
            viewportRef={viewportRef}
          />
        </div>
      );
    }

    render(<ShellStandIn />);
    expect(parentRenderCount).toBe(1);

    act(() => {
      useAppStore.setState({ viewportPan: { x: 5, y: 5 } });
    });
    act(() => {
      useAppStore.setState({ viewportPan: { x: 10, y: 10 } });
    });
    act(() => {
      useAppStore.setState({ viewportZoom: 1.8 });
    });

    // Three viewport commits landed and the canvas visibly picked them up
    // (checked in the sibling describe block above) — the shell stand-in
    // must still be at exactly its one mount render.
    expect(parentRenderCount).toBe(1);

    const contentNode = document.querySelector(".will-change-transform") as HTMLElement;
    expect(contentNode.style.transform).toBe("translate(10px, 10px) scale(1.8)");
  });
});

describe("MapViewerCanvas pointer gesture surface", () => {
  beforeEach(() => {
    useAppStore.setState(INITIAL_VIEWPORT_STATE);
  });

  afterEach(() => {
    cleanup();
    useAppStore.setState(INITIAL_VIEWPORT_STATE);
  });

  // The floor's rendered SVG only covers its own pixel dimensions, not the
  // full viewport - when the floor doesn't fill the whole visible area
  // (zoomed out, or just a smaller floor than the viewport, as here), there
  // is real empty space inside the viewport container where no SVG element
  // exists at all. A pointer gesture (touch drag/pinch) that starts there
  // used to never reach any handler, since onPointerDown/Move/Up used to be
  // wired to the SVG element itself - only the wheel listener was ever on
  // the full-size container. Dispatching directly on the outer container
  // (not a descendant) simulates exactly that empty-space press.
  it("still calls onPointerDown for a press that lands on the outer viewport, outside the rendered SVG", () => {
    const onPointerDown = vi.fn();

    function Harness() {
      const viewportRef = useRef<HTMLDivElement | null>(null);
      const contentRef = useRef<HTMLDivElement | null>(null);

      return (
        <MapViewerCanvas
          activeFloor={activeFloor}
          connectorTargetsByNodeId={{}}
          destinationObjectId={null}
          contentRef={contentRef}
          edges={[]}
          nodes={[]}
          objects={[]}
          onBackgroundClick={vi.fn()}
          onConnectorActivate={vi.fn()}
          onObjectSelect={vi.fn()}
          onPointerCancel={vi.fn()}
          onPointerDown={onPointerDown}
          onPointerLeave={vi.fn()}
          onPointerMove={vi.fn()}
          onPointerUp={vi.fn()}
          originObjectId={null}
          routeConnectorDirection={null}
          routeConnectorNodeId={null}
          selectedObjectId={null}
          showGrid={false}
          viewportRef={viewportRef}
        />
      );
    }

    const { container } = render(<Harness />);

    // The outer viewport div - the same element the wheel listener has
    // always used - not the nested <svg>, which is a smaller descendant
    // sized to the floor's own rendered dimensions.
    const viewportNode = container.querySelector(".cursor-grab, .cursor-grabbing") as HTMLElement;
    expect(viewportNode.tagName).toBe("DIV");
    expect(viewportNode.querySelector("svg")).not.toBeNull();

    fireEvent.pointerDown(viewportNode, { clientX: 5, clientY: 5, pointerId: 1 });

    expect(onPointerDown).toHaveBeenCalledTimes(1);
  });

  it("still calls onPointerDown for a press that lands directly on the rendered SVG", () => {
    const onPointerDown = vi.fn();

    function Harness() {
      const viewportRef = useRef<HTMLDivElement | null>(null);
      const contentRef = useRef<HTMLDivElement | null>(null);

      return (
        <MapViewerCanvas
          activeFloor={activeFloor}
          connectorTargetsByNodeId={{}}
          destinationObjectId={null}
          contentRef={contentRef}
          edges={[]}
          nodes={[]}
          objects={[]}
          onBackgroundClick={vi.fn()}
          onConnectorActivate={vi.fn()}
          onObjectSelect={vi.fn()}
          onPointerCancel={vi.fn()}
          onPointerDown={onPointerDown}
          onPointerLeave={vi.fn()}
          onPointerMove={vi.fn()}
          onPointerUp={vi.fn()}
          originObjectId={null}
          routeConnectorDirection={null}
          routeConnectorNodeId={null}
          selectedObjectId={null}
          showGrid={false}
          viewportRef={viewportRef}
        />
      );
    }

    const { container } = render(<Harness />);
    const svgNode = container.querySelector("svg") as SVGSVGElement;

    // A press directly on the SVG still needs to reach the same handler via
    // native bubbling up to the outer container - proves relocating the
    // listener didn't break the on-map case it already had to handle.
    fireEvent.pointerDown(svgNode, { clientX: 50, clientY: 50, pointerId: 1 });

    expect(onPointerDown).toHaveBeenCalledTimes(1);
  });
});
