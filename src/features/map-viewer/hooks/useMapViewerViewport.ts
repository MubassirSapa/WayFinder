import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";

import { MAP_VIEWER_DRAG_THRESHOLD } from "../constants/mapViewer.constants";
import {
  clampPanToViewport,
  clampZoom,
  getDefaultViewState,
  getDistance,
  getFitBoundsView,
  getMidpoint,
  type Point,
  type WorldBounds,
} from "../lib/mapViewerViewport";
import type { ViewerFloor } from "../types/map-viewer.types";

interface PinchState {
  initialDistance: number;
  initialZoom: number;
  worldCenter: Point;
}

interface UseMapViewerViewportArgs {
  activeFloor: ViewerFloor | null;
  activeFloorId: string | null;
  floors: ViewerFloor[];
}

export function useMapViewerViewport({
  activeFloor,
  activeFloorId,
  floors,
}: UseMapViewerViewportArgs) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [viewportSize, setViewportSize] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const initializedFloorIdRef = useRef<string | null>(null);
  const pendingFocusRef = useRef(false);
  const suppressClickRef = useRef(false);
  const dragSurfaceRef = useRef<SVGSVGElement | null>(null);
  const activePointersRef = useRef<Map<number, Point>>(new Map());
  const pinchStateRef = useRef<PinchState | null>(null);
  const dragStateRef = useRef<{
    didMove: boolean;
    originPan: Point;
    pointerId: number;
    start: Point;
  } | null>(null);

  useEffect(() => {
    const element = viewportRef.current;

    if (!element) {
      return;
    }

    const updateSize = () => {
      const nextViewport = {
        x: element.clientWidth,
        y: element.clientHeight,
      };

      setViewportSize(nextViewport);

      const floor = floors.find((candidate) => candidate.id === activeFloorId);
      if (!floor) {
        initializedFloorIdRef.current = null;
        return;
      }

      if (initializedFloorIdRef.current !== floor.id) {
        initializedFloorIdRef.current = floor.id;

        // A route floor-hop already set an explicit pan/zoom via
        // focusWorldBounds just before this floor change — keep it instead
        // of overriding it with the floor's default fit-to-view.
        if (pendingFocusRef.current) {
          pendingFocusRef.current = false;
          setPan((currentPan) => clampPanToViewport(currentPan, floor, nextViewport, zoom));
          return;
        }

        const defaultView = getDefaultViewState(floor, nextViewport);
        setZoom(defaultView.zoom);
        setPan(defaultView.pan);
        return;
      }

      setPan((currentPan) => clampPanToViewport(currentPan, floor, nextViewport, zoom));
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, [activeFloorId, floors, zoom]);

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
    setIsDragging(false);
  };

  const changeZoom = (direction: "in" | "out") => {
    const nextZoom = clampZoom(direction === "in" ? zoom * 1.15 : zoom / 1.15, viewportSize.x);

    if (!activeFloor) {
      setZoom(nextZoom);
      return;
    }

    const centerX = viewportSize.x / 2;
    const centerY = viewportSize.y / 2;
    const worldX = (centerX - pan.x) / zoom;
    const worldY = (centerY - pan.y) / zoom;

    setZoom(nextZoom);
    setPan(
      clampPanToViewport(
        {
          x: centerX - worldX * nextZoom,
          y: centerY - worldY * nextZoom,
        },
        activeFloor,
        viewportSize,
        nextZoom,
      ),
    );
  };

  const resetView = () => {
    const nextViewport = viewportRef.current
      ? {
          x: viewportRef.current.clientWidth,
          y: viewportRef.current.clientHeight,
        }
      : viewportSize;

    if (!activeFloor || nextViewport.x === 0 || nextViewport.y === 0) {
      return;
    }

    const defaultView = getDefaultViewState(activeFloor, nextViewport);
    setZoom(defaultView.zoom);
    setPan(defaultView.pan);
  };

  const focusWorldPoint = (worldPoint: Point) => {
    if (!activeFloor) {
      return;
    }

    const nextPan = {
      x: viewportSize.x / 2 - worldPoint.x * zoom,
      y: viewportSize.y / 2 - worldPoint.y * zoom,
    };

    setPan(clampPanToViewport(nextPan, activeFloor, viewportSize, zoom));
  };

  const focusWorldBounds = (bounds: WorldBounds) => {
    if (viewportSize.x === 0 || viewportSize.y === 0) {
      return;
    }

    pendingFocusRef.current = true;
    const fitView = getFitBoundsView(bounds, viewportSize);
    setZoom(fitView.zoom);
    setPan(fitView.pan);
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
      setIsDragging(false);
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
      setIsDragging(false);
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
  useEffect(() => {
    const element = viewportRef.current;
    if (!element) {
      return;
    }

    const handleWheel = (event: globalThis.WheelEvent) => {
      event.preventDefault();

      const nextZoom = clampZoom(
        event.deltaY > 0 ? zoom / 1.08 : zoom * 1.08,
        viewportSize.x,
      );
      const viewportRect = element.getBoundingClientRect();

      if (!activeFloor) {
        setZoom(nextZoom);
        return;
      }

      const pointerX = event.clientX - viewportRect.left;
      const pointerY = event.clientY - viewportRect.top;
      const worldX = (pointerX - pan.x) / zoom;
      const worldY = (pointerY - pan.y) / zoom;

      setZoom(nextZoom);
      setPan(
        clampPanToViewport(
          {
            x: pointerX - worldX * nextZoom,
            y: pointerY - worldY * nextZoom,
          },
          activeFloor,
          viewportSize,
          nextZoom,
        ),
      );
    };

    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => element.removeEventListener("wheel", handleWheel);
  }, [activeFloor, pan, viewportSize, zoom]);

  const handleSvgPointerDown = (event: PointerEvent<SVGSVGElement>) => {
    if (
      !activeFloor
      || (event.pointerType === "mouse" && event.button !== 0)
    ) {
      return;
    }

    dragSurfaceRef.current = event.currentTarget;
    event.currentTarget.setPointerCapture(event.pointerId);
    activePointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    suppressClickRef.current = false;

    const pointers = Array.from(activePointersRef.current.values());

    if (pointers.length === 1) {
      pinchStateRef.current = null;
      dragStateRef.current = {
        didMove: false,
        originPan: pan,
        pointerId: event.pointerId,
        start: {
          x: event.clientX,
          y: event.clientY,
        },
      };
      setIsDragging(true);
      return;
    }

    if (pointers.length === 2) {
      const [firstPointer, secondPointer] = pointers;
      const midpoint = getMidpoint(firstPointer, secondPointer);
      const initialDistance = getDistance(firstPointer, secondPointer);

      if (initialDistance > 0) {
        pinchStateRef.current = {
          initialDistance,
          initialZoom: zoom,
          worldCenter: {
            x: (midpoint.x - pan.x) / zoom,
            y: (midpoint.y - pan.y) / zoom,
          },
        };
        dragStateRef.current = null;
        suppressClickRef.current = true;
        setIsDragging(false);
      }
    }
  };

  const handleSvgPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!activeFloor) {
      return;
    }

    activePointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

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
        );
        const nextPan = {
          x: midpoint.x - pinchState.worldCenter.x * nextZoom,
          y: midpoint.y - pinchState.worldCenter.y * nextZoom,
        };

        setZoom(nextZoom);
        setPan(clampPanToViewport(nextPan, activeFloor, viewportSize, nextZoom));
      }
      return;
    }

    const dragState = dragStateRef.current;

    if (!dragState) {
      return;
    }

    const deltaX = event.clientX - dragState.start.x;
    const deltaY = event.clientY - dragState.start.y;

    if (!dragState.didMove && Math.hypot(deltaX, deltaY) > MAP_VIEWER_DRAG_THRESHOLD) {
      dragState.didMove = true;
      suppressClickRef.current = true;
    }

    setPan(
      clampPanToViewport(
        {
          x: dragState.originPan.x + deltaX,
          y: dragState.originPan.y + deltaY,
        },
        activeFloor,
        viewportSize,
        zoom,
      ),
    );
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
      setIsDragging(false);
    }

    if (didMove || suppressClickRef.current) {
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
  };

  return {
    changeZoom,
    consumeSuppressedClick,
    focusWorldBounds,
    focusWorldPoint,
    isDragging,
    pan,
    resetView,
    viewportRef,
    zoom,
    handleSvgPointerDown,
    handleSvgPointerMove,
    handleSvgPointerUp,
    handleViewportPointerCancel,
    handleViewportPointerLeave,
    handleViewportPointerUp,
  };
}
