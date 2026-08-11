import { useEffect, useRef } from "react";
import type { PointerEvent, RefObject } from "react";

import { MAP_VIEWER_DRAG_THRESHOLD } from "../constants/mapViewer.constants";
import { buildPanZoomTransform } from "../lib/mapViewerTransform";
import {
  clampPanToViewport,
  clampZoom,
  getDistance,
  getMidpoint,
  getRawFitZoom,
  type Point,
} from "../lib/mapViewerViewport";
import { defaultMapViewerViewportBinding, type MapViewerViewportBinding } from "../store/mapViewerViewportBinding";
import type { ViewerFloor } from "../types/map-viewer.types";

interface PinchState {
  initialDistance: number;
  initialZoom: number;
  worldCenter: Point;
}

interface UseMapViewerViewportGesturesArgs {
  activeFloor: ViewerFloor | null;
  viewportBinding?: MapViewerViewportBinding;
  viewportRef: RefObject<HTMLDivElement | null>;
  viewportSize: Point;
}

// Panning/zooming happens up to 60-120 times a second while a gesture is in
// flight. Committing every one of those through React state would re-render
// whatever reads pan/zoom on every single frame. Instead, each gesture here
// writes the transform straight to the DOM via `contentRef` (so the visual
// feedback has zero React latency) and only asks the store to catch up at
// most once per animation frame — cheap, and still exact by the time the
// gesture ends, since pointer-up flushes the pending value immediately.
export function useMapViewerViewportGestures({
  activeFloor,
  viewportBinding = defaultMapViewerViewportBinding,
  viewportRef,
  viewportSize,
}: UseMapViewerViewportGesturesArgs) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const dragSurfaceRef = useRef<SVGSVGElement | null>(null);
  const activePointersRef = useRef<Map<number, Point>>(new Map());
  const pinchStateRef = useRef<PinchState | null>(null);
  const suppressClickRef = useRef(false);
  const dragStateRef = useRef<{
    didMove: boolean;
    originPan: Point;
    pointerId: number;
    start: Point;
  } | null>(null);

  const pendingCommitRef = useRef<{ pan: Point; zoom: number } | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const applyTransform = (pan: Point, zoom: number) => {
    if (contentRef.current) {
      contentRef.current.style.transform = buildPanZoomTransform(pan, zoom);
    }
  };

  const scheduleCommit = (pan: Point, zoom: number) => {
    pendingCommitRef.current = { pan, zoom };

    if (rafIdRef.current !== null) {
      return;
    }

    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      const pending = pendingCommitRef.current;
      pendingCommitRef.current = null;

      if (pending) {
        viewportBinding.setViewportView(pending);
      }
    });
  };

  const flushCommit = () => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    const pending = pendingCommitRef.current;
    pendingCommitRef.current = null;

    if (pending) {
      viewportBinding.setViewportView(pending);
    }
  };

  // The value a gesture should build the next frame on top of — the last
  // not-yet-committed value if one is pending (several pointermoves can land
  // within the same animation frame), otherwise the store's committed value.
  const getLiveView = () => {
    if (pendingCommitRef.current) {
      return pendingCommitRef.current;
    }

    return viewportBinding.getViewportView();
  };

  // Pan values are relative to the map viewport, while PointerEvent client
  // coordinates are relative to the browser window. Mixing those spaces
  // makes a pinch anchor jump by the page header/sidebar offset, which is
  // especially visible on phones. Keep every tracked pointer viewport-local.
  const getViewportPoint = (event: PointerEvent<SVGSVGElement>): Point => {
    const rect = viewportRef.current?.getBoundingClientRect();
    return {
      x: event.clientX - (rect?.left ?? 0),
      y: event.clientY - (rect?.top ?? 0),
    };
  };

  const beginPinch = (pointers: Point[]) => {
    if (pointers.length < 2) {
      return false;
    }

    const [firstPointer, secondPointer] = pointers;
    const midpoint = getMidpoint(firstPointer, secondPointer);
    const initialDistance = getDistance(firstPointer, secondPointer);
    if (initialDistance <= 0) {
      return false;
    }

    const live = getLiveView();
    pinchStateRef.current = {
      initialDistance,
      initialZoom: live.zoom,
      worldCenter: {
        x: (midpoint.x - live.pan.x) / live.zoom,
        y: (midpoint.y - live.pan.y) / live.zoom,
      },
    };
    dragStateRef.current = null;
    suppressClickRef.current = true;
    viewportBinding.setIsViewportDragging(false);
    return true;
  };

  // Flush only on true unmount, not on every viewportBinding identity change
  // (always stable in practice - the default binding is a module-level
  // singleton, and any custom binding a caller passes should be too) -
  // intentionally empty deps, same as the wheel effect below.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => flushCommit(), []);

  const clearGestureState = (pointerId?: number) => {
    if (
      pointerId !== undefined
      && dragSurfaceRef.current?.hasPointerCapture(pointerId)
    ) {
      dragSurfaceRef.current.releasePointerCapture(pointerId);
    }

    activePointersRef.current.delete(pointerId ?? -1);
    pinchStateRef.current = null;
    dragStateRef.current = null;
    flushCommit();
    viewportBinding.setIsViewportDragging(false);
  };

  const consumeSuppressedClick = () => {
    if (!suppressClickRef.current) {
      return false;
    }

    suppressClickRef.current = false;
    return true;
  };

  const handleViewportPointerCancel = () => {
    const didMove = dragStateRef.current?.didMove;
    const pointerId = dragStateRef.current?.pointerId;
    if (pointerId !== undefined) {
      clearGestureState(pointerId);
    } else {
      pinchStateRef.current = null;
      dragStateRef.current = null;
      flushCommit();
      viewportBinding.setIsViewportDragging(false);
    }
    activePointersRef.current.clear();
    if (didMove) {
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
  };

  const handleViewportPointerLeave = () => {
    if (!dragSurfaceRef.current || !dragStateRef.current) {
      return;
    }

    if (!dragSurfaceRef.current.hasPointerCapture(dragStateRef.current.pointerId)) {
      dragStateRef.current = null;
      viewportBinding.setIsViewportDragging(false);
    }
  };

  const handleViewportPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStateRef.current?.pointerId === event.pointerId) {
      clearGestureState(event.pointerId);
    }
  };

  // Registered as a native, non-passive listener (not a React onWheel prop)
  // deliberately: React attaches wheel listeners at the root as passive by
  // default, which silently blocks event.preventDefault() from working —
  // the map would zoom, but the browser's own page zoom/scroll would fire
  // right alongside it. A real addEventListener with { passive: false } is
  // the only way to actually suppress the native behavior.
  //
  // Reads pan/zoom via getLiveView() instead of closing over reactive state,
  // so this effect only needs to re-attach when the floor or viewport size
  // actually changes — not on every zoom tick.
  useEffect(() => {
    const element = viewportRef.current;
    if (!element) {
      return;
    }

    const handleWheel = (event: globalThis.WheelEvent) => {
      event.preventDefault();

      const live = getLiveView();
      const rawFitZoom = activeFloor ? getRawFitZoom(activeFloor, viewportSize) : undefined;
      const nextZoom = clampZoom(
        event.deltaY > 0 ? live.zoom / 1.08 : live.zoom * 1.08,
        viewportSize.x,
        rawFitZoom,
      );
      const viewportRect = element.getBoundingClientRect();

      if (!activeFloor) {
        scheduleCommit(live.pan, nextZoom);
        return;
      }

      const pointerX = event.clientX - viewportRect.left;
      const pointerY = event.clientY - viewportRect.top;
      const worldX = (pointerX - live.pan.x) / live.zoom;
      const worldY = (pointerY - live.pan.y) / live.zoom;

      const nextPan = clampPanToViewport(
        {
          x: pointerX - worldX * nextZoom,
          y: pointerY - worldY * nextZoom,
        },
        activeFloor,
        viewportSize,
        nextZoom,
      );

      applyTransform(nextPan, nextZoom);
      scheduleCommit(nextPan, nextZoom);
    };

    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      element.removeEventListener("wheel", handleWheel);
      flushCommit();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFloor, viewportSize]);

  const handleSvgPointerDown = (event: PointerEvent<SVGSVGElement>) => {
    if (
      !activeFloor
      || (event.pointerType === "mouse" && event.button !== 0)
    ) {
      return;
    }

    dragSurfaceRef.current = event.currentTarget;
    event.currentTarget.setPointerCapture(event.pointerId);
    const pointer = getViewportPoint(event);
    activePointersRef.current.set(event.pointerId, pointer);
    suppressClickRef.current = false;

    const pointers = Array.from(activePointersRef.current.values());

    if (pointers.length === 1) {
      pinchStateRef.current = null;
      dragStateRef.current = {
        didMove: false,
        originPan: getLiveView().pan,
        pointerId: event.pointerId,
        start: pointer,
      };
      viewportBinding.setIsViewportDragging(true);
      return;
    }

    if (pointers.length === 2) {
      beginPinch(pointers);
    }
  };

  const handleSvgPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!activeFloor) {
      return;
    }

    if (!activePointersRef.current.has(event.pointerId)) {
      return;
    }

    const pointer = getViewportPoint(event);
    activePointersRef.current.set(event.pointerId, pointer);

    const activePointers = Array.from(activePointersRef.current.values());
    const pinchState = pinchStateRef.current;

    if (pinchState && activePointers.length >= 2) {
      const [firstPointer, secondPointer] = activePointers;
      const currentDistance = getDistance(firstPointer, secondPointer);

      if (currentDistance > 0) {
        const midpoint = getMidpoint(firstPointer, secondPointer);
        const nextZoom = clampZoom(
          pinchState.initialZoom * (currentDistance / pinchState.initialDistance),
          viewportSize.x,
          getRawFitZoom(activeFloor, viewportSize),
        );
        const nextPan = clampPanToViewport(
          {
            x: midpoint.x - pinchState.worldCenter.x * nextZoom,
            y: midpoint.y - pinchState.worldCenter.y * nextZoom,
          },
          activeFloor,
          viewportSize,
          nextZoom,
        );

        applyTransform(nextPan, nextZoom);
        scheduleCommit(nextPan, nextZoom);
      }
      return;
    }

    const dragState = dragStateRef.current;

    if (!dragState) {
      return;
    }

    const deltaX = pointer.x - dragState.start.x;
    const deltaY = pointer.y - dragState.start.y;

    if (!dragState.didMove && Math.hypot(deltaX, deltaY) > MAP_VIEWER_DRAG_THRESHOLD) {
      dragState.didMove = true;
      suppressClickRef.current = true;
    }

    const zoom = getLiveView().zoom;
    const nextPan = clampPanToViewport(
      {
        x: dragState.originPan.x + deltaX,
        y: dragState.originPan.y + deltaY,
      },
      activeFloor,
      viewportSize,
      zoom,
    );

    applyTransform(nextPan, zoom);
    scheduleCommit(nextPan, zoom);
  };

  const handleSvgPointerUp = (event: PointerEvent<SVGSVGElement>) => {
    const didMove = dragStateRef.current?.didMove;
    activePointersRef.current.delete(event.pointerId);
    pinchStateRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (dragStateRef.current?.pointerId === event.pointerId) {
      dragStateRef.current = null;
      flushCommit();
      viewportBinding.setIsViewportDragging(false);
    } else {
      flushCommit();
    }

    const remainingPointers = Array.from(activePointersRef.current.entries());
    if (remainingPointers.length >= 2) {
      beginPinch(remainingPointers.map(([, point]) => point));
    } else if (remainingPointers.length === 1 && suppressClickRef.current) {
      const [pointerId, point] = remainingPointers[0];
      dragStateRef.current = {
        didMove: true,
        originPan: getLiveView().pan,
        pointerId,
        start: point,
      };
      viewportBinding.setIsViewportDragging(true);
    }

    // Keep suppression armed until every finger is lifted. Clearing it after
    // the first pointer-up lets the final synthetic click select an object.
    if (activePointersRef.current.size === 0 && (didMove || suppressClickRef.current)) {
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
  };

  return {
    consumeSuppressedClick,
    contentRef,
    handleSvgPointerDown,
    handleSvgPointerMove,
    handleSvgPointerUp,
    handleViewportPointerCancel,
    handleViewportPointerLeave,
    handleViewportPointerUp,
  };
}
