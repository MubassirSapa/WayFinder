import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useApplyRouteFromUrl } from "@/features/navigation/hooks/useApplyRouteFromUrl";
import type { ViewerMapNode } from "@/features/map-viewer/types/map-viewer.types";
import { useAppStore } from "@/store";

const router = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("nextjs-toploader/app", () => ({
  useRouter: () => router,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/map/floor-a",
}));

const toastError = vi.hoisted(() => vi.fn());

vi.mock("sonner", () => ({
  toast: { error: toastError },
}));

const startNode: ViewerMapNode = {
  id: "node-start",
  floorId: "floor-a",
  buildingId: "building-1",
  objectId: "object-start",
  role: "entrance",
  label: "Start",
  x: 0,
  y: 0,
  geometryType: "icon",
  isAccessible: true,
};
const destNode: ViewerMapNode = { ...startNode, id: "node-dest", objectId: "object-dest", role: "hallway_point", label: "Dest" };
const nodes = [startNode, destNode];

const RESET_NAVIGATION_STATE = {
  accessibleOnly: false,
  activeFloorId: null,
  activeSegmentIndex: 0,
  destinationNodeId: null,
  originNodeId: null,
};

beforeEach(() => {
  useAppStore.setState(RESET_NAVIGATION_STATE);
  router.replace.mockClear();
  toastError.mockClear();
});

afterEach(() => {
  useAppStore.setState(RESET_NAVIGATION_STATE);
  vi.restoreAllMocks();
});

describe("useApplyRouteFromUrl", () => {
  it("applies both origin and destination when both objects resolve, without flagging the origin as selected", () => {
    const onOriginObjectResolved = vi.fn();

    renderHook(() => useApplyRouteFromUrl({
      accessibleOnly: false,
      destObjectId: "object-dest",
      initialFloorId: "floor-a",
      nodes,
      onOriginObjectResolved,
      startObjectId: "object-start",
    }));

    expect(useAppStore.getState().originNodeId).toBe("node-start");
    expect(useAppStore.getState().destinationNodeId).toBe("node-dest");
    expect(onOriginObjectResolved).not.toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith("/map/floor-a", { scroll: false });
  });

  it("applies only the origin for a start-only link, and flags it as the selected object", () => {
    const onOriginObjectResolved = vi.fn();

    renderHook(() => useApplyRouteFromUrl({
      accessibleOnly: false,
      destObjectId: null,
      initialFloorId: "floor-a",
      nodes,
      onOriginObjectResolved,
      startObjectId: "object-start",
    }));

    expect(useAppStore.getState().originNodeId).toBe("node-start");
    expect(useAppStore.getState().destinationNodeId).toBeNull();
    expect(onOriginObjectResolved).toHaveBeenCalledWith("object-start");
    expect(router.replace).toHaveBeenCalledTimes(1);
  });

  it("toasts and leaves origin unset when startObject has no matching node, but still strips the URL", () => {
    renderHook(() => useApplyRouteFromUrl({
      accessibleOnly: false,
      destObjectId: null,
      initialFloorId: "floor-a",
      nodes,
      startObjectId: "object-unmapped",
    }));

    expect(useAppStore.getState().originNodeId).toBeNull();
    expect(toastError).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledTimes(1);
  });

  it("turns accessibleOnly on when the URL asked for it alongside a resolving destination", () => {
    renderHook(() => useApplyRouteFromUrl({
      accessibleOnly: true,
      destObjectId: "object-dest",
      initialFloorId: "floor-a",
      nodes,
      startObjectId: null,
    }));

    expect(useAppStore.getState().accessibleOnly).toBe(true);
  });

  it("does nothing when neither startObject nor destObject is present", () => {
    renderHook(() => useApplyRouteFromUrl({
      accessibleOnly: true,
      destObjectId: null,
      initialFloorId: "floor-a",
      nodes,
      startObjectId: null,
    }));

    expect(useAppStore.getState().originNodeId).toBeNull();
    expect(useAppStore.getState().destinationNodeId).toBeNull();
    expect(useAppStore.getState().accessibleOnly).toBe(false);
    expect(router.replace).not.toHaveBeenCalled();
  });
});
