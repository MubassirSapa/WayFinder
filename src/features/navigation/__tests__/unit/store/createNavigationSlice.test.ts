import { describe, expect, it } from "vitest";
import { create, type StateCreator } from "zustand";

import { createNavigationSlice, type NavigationSlice } from "@/features/navigation/store/createNavigationSlice";

describe("createNavigationSlice", () => {
  it("clears both route endpoints so free floor navigation becomes available", () => {
    const store = create<NavigationSlice>()(
      createNavigationSlice as unknown as StateCreator<NavigationSlice>,
    );

    store.getState().setOrigin("start-node");
    store.getState().setDestination("destination-node");
    store.getState().setActiveSegmentIndex(2);
    store.getState().clearRoute();

    expect(store.getState().originNodeId).toBeNull();
    expect(store.getState().destinationNodeId).toBeNull();
    expect(store.getState().activeSegmentIndex).toBe(0);
  });

  it("closes the route search drawer whenever the route (or the whole session) is cleared", () => {
    const store = create<NavigationSlice>()(
      createNavigationSlice as unknown as StateCreator<NavigationSlice>,
    );

    store.getState().setRouteSearchOpen(true);
    store.getState().clearRoute();
    expect(store.getState().isRouteSearchOpen).toBe(false);

    store.getState().setRouteSearchOpen(true);
    store.getState().resetNavigation();
    expect(store.getState().isRouteSearchOpen).toBe(false);
  });
});
