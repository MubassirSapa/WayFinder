import { beforeEach, describe, expect, it } from "vitest";

import { makeStore } from "./makeStore";

describe("QrViewerViewportSlice", () => {
  let store: ReturnType<typeof makeStore>;
  beforeEach(() => {
    store = makeStore();
  });

  it("starts centered at zoom 1 and not dragging", () => {
    const state = store.getState();
    expect(state.qrViewerPan).toEqual({ x: 0, y: 0 });
    expect(state.qrViewerZoom).toBe(1);
    expect(state.isQrViewerDragging).toBe(false);
  });

  it("setQrViewerPan updates only the pan", () => {
    store.getState().setQrViewerPan({ x: 12, y: -8 });
    const state = store.getState();
    expect(state.qrViewerPan).toEqual({ x: 12, y: -8 });
    expect(state.qrViewerZoom).toBe(1);
  });

  it("setQrViewerZoom updates only the zoom", () => {
    store.getState().setQrViewerZoom(1.5);
    const state = store.getState();
    expect(state.qrViewerZoom).toBe(1.5);
    expect(state.qrViewerPan).toEqual({ x: 0, y: 0 });
  });

  it("setQrViewerView commits pan and zoom together in one update", () => {
    store.getState().setQrViewerView({ pan: { x: 40, y: 20 }, zoom: 2 });
    const state = store.getState();
    expect(state.qrViewerPan).toEqual({ x: 40, y: 20 });
    expect(state.qrViewerZoom).toBe(2);
  });

  it("setIsQrViewerDragging toggles the dragging flag independently of pan/zoom", () => {
    store.getState().setQrViewerView({ pan: { x: 5, y: 5 }, zoom: 1.2 });
    store.getState().setIsQrViewerDragging(true);
    expect(store.getState().isQrViewerDragging).toBe(true);
    expect(store.getState().qrViewerPan).toEqual({ x: 5, y: 5 });

    store.getState().setIsQrViewerDragging(false);
    expect(store.getState().isQrViewerDragging).toBe(false);
  });

  it("only notifies subscribers of the slice they selected", () => {
    let panNotifications = 0;
    let dragNotifications = 0;

    const unsubscribePan = store.subscribe((state, prev) => {
      if (state.qrViewerPan !== prev.qrViewerPan) {
        panNotifications += 1;
      }
    });
    const unsubscribeDrag = store.subscribe((state, prev) => {
      if (state.isQrViewerDragging !== prev.isQrViewerDragging) {
        dragNotifications += 1;
      }
    });

    store.getState().setQrViewerPan({ x: 1, y: 1 });
    store.getState().setQrViewerPan({ x: 2, y: 2 });
    store.getState().setIsQrViewerDragging(true);

    expect(panNotifications).toBe(2);
    expect(dragNotifications).toBe(1);

    unsubscribePan();
    unsubscribeDrag();
  });
});
