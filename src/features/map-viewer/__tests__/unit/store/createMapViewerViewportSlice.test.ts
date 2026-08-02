import { beforeEach, describe, expect, it } from "vitest";

import { makeStore } from "./makeStore";

describe("MapViewerViewportSlice", () => {
  let store: ReturnType<typeof makeStore>;
  beforeEach(() => {
    store = makeStore();
  });

  it("starts centered at zoom 1 and not dragging", () => {
    const state = store.getState();
    expect(state.viewportPan).toEqual({ x: 0, y: 0 });
    expect(state.viewportZoom).toBe(1);
    expect(state.isViewportDragging).toBe(false);
  });

  it("setViewportPan updates only the pan", () => {
    store.getState().setViewportPan({ x: 12, y: -8 });
    const state = store.getState();
    expect(state.viewportPan).toEqual({ x: 12, y: -8 });
    expect(state.viewportZoom).toBe(1);
  });

  it("setViewportZoom updates only the zoom", () => {
    store.getState().setViewportZoom(1.5);
    const state = store.getState();
    expect(state.viewportZoom).toBe(1.5);
    expect(state.viewportPan).toEqual({ x: 0, y: 0 });
  });

  it("setViewportView commits pan and zoom together in one update", () => {
    store.getState().setViewportView({ pan: { x: 40, y: 20 }, zoom: 2 });
    const state = store.getState();
    expect(state.viewportPan).toEqual({ x: 40, y: 20 });
    expect(state.viewportZoom).toBe(2);
  });

  it("setIsViewportDragging toggles the dragging flag independently of pan/zoom", () => {
    store.getState().setViewportView({ pan: { x: 5, y: 5 }, zoom: 1.2 });
    store.getState().setIsViewportDragging(true);
    expect(store.getState().isViewportDragging).toBe(true);
    expect(store.getState().viewportPan).toEqual({ x: 5, y: 5 });

    store.getState().setIsViewportDragging(false);
    expect(store.getState().isViewportDragging).toBe(false);
  });

  it("only notifies subscribers of the slice they selected", () => {
    let panNotifications = 0;
    let dragNotifications = 0;

    const unsubscribePan = store.subscribe((state, prev) => {
      if (state.viewportPan !== prev.viewportPan) {
        panNotifications += 1;
      }
    });
    const unsubscribeDrag = store.subscribe((state, prev) => {
      if (state.isViewportDragging !== prev.isViewportDragging) {
        dragNotifications += 1;
      }
    });

    store.getState().setViewportPan({ x: 1, y: 1 });
    store.getState().setViewportPan({ x: 2, y: 2 });
    store.getState().setIsViewportDragging(true);

    expect(panNotifications).toBe(2);
    expect(dragNotifications).toBe(1);

    unsubscribePan();
    unsubscribeDrag();
  });
});
