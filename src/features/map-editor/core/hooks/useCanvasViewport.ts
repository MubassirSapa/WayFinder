'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

import { useAppStore } from '@/store';

import {
  EDITOR_VIEWPORT_BUTTON_ZOOM_FACTOR,
  EDITOR_VIEWPORT_DRAG_THRESHOLD,
  EDITOR_VIEWPORT_WHEEL_ZOOM_FACTOR,
} from '../constants/canvasViewport.constants';
import {
  clampEditorPan,
  clampEditorZoom,
  getEditorDefaultView,
  type Point,
} from '../lib/canvasViewport';

interface UseCanvasViewportArgs {
  floorHeight: number;
  floorId: string | null;
  floorWidth: number;
}

export function useCanvasViewport({ floorHeight, floorId, floorWidth }: UseCanvasViewportArgs) {
  const wrapperRef: RefObject<HTMLDivElement | null> = useRef(null);
  const hasFitRef = useRef(false);
  const dragStateRef = useRef<{
    didMove: boolean;
    originPan: Point;
    pointerId: number;
    start: Point;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const [isPanning, setIsPanning] = useState(false);

  const editorViewportPan = useAppStore((state) => state.editorViewportPan);
  const editorViewportZoom = useAppStore((state) => state.editorViewportZoom);
  const isResizingFloor = useAppStore((state) => state.isResizingFloor);
  const setEditorViewportView = useAppStore((state) => state.setEditorViewportView);

  const getViewportSize = useCallback((): Point => {
    const element = wrapperRef.current;
    return element ? { x: element.clientWidth, y: element.clientHeight } : { x: 0, y: 0 };
  }, []);

  // A floor with new dimensions - a real floor switch (floorId changes), or
  // the reference-image upload auto-sizing the canvas to the image (see
  // FloorReferencePanel) - should always re-fit. Different from the map
  // viewer, which only re-fits on a floor switch and just re-clamps on a
  // plain resize: here a same-floor dimension change has no other UI hinting
  // the new size, so silently keeping a stale zoom/pan would leave the frame
  // looking wrong or clipped. Suppressed entirely while the resize handle
  // (FloorResizeHandle) is being dragged - floorWidth/floorHeight change on
  // every mousemove tick then, and re-fitting on each one would fight the
  // drag instead of just letting the floor grow/shrink under the user's
  // current view. isResizingFloor flipping back to false re-runs this
  // effect once more, which re-clamps (not a full re-fit, since hasFitRef
  // was never reset) the final pan/zoom to stay valid for the new size.
  useEffect(() => {
    if (isResizingFloor) {
      return;
    }

    hasFitRef.current = false;
  }, [floorId, floorWidth, floorHeight, isResizingFloor]);

  useEffect(() => {
    const element = wrapperRef.current;
    if (!element || isResizingFloor) {
      return;
    }

    const updateForViewport = () => {
      if (floorWidth <= 0 || floorHeight <= 0) {
        return;
      }

      const viewport = getViewportSize();
      if (viewport.x === 0 || viewport.y === 0) {
        return;
      }

      if (!hasFitRef.current) {
        setEditorViewportView(getEditorDefaultView({ width: floorWidth, height: floorHeight }, viewport));
        hasFitRef.current = true;
        return;
      }

      const current = useAppStore.getState();
      setEditorViewportView({
        pan: clampEditorPan(
          current.editorViewportPan,
          { width: floorWidth, height: floorHeight },
          viewport,
          current.editorViewportZoom,
        ),
        zoom: current.editorViewportZoom,
      });
    };

    updateForViewport();
    const observer = new ResizeObserver(updateForViewport);
    observer.observe(element);
    return () => observer.disconnect();
  }, [floorWidth, floorHeight, isResizingFloor, getViewportSize, setEditorViewportView]);

  // Registered as a native, non-passive listener (not a React onWheel prop)
  // deliberately - React's root-level wheel listener is passive by default,
  // which silently blocks preventDefault(): the canvas would zoom, but the
  // browser's own page scroll/zoom would fire right alongside it.
  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      const current = useAppStore.getState();
      const nextZoom = clampEditorZoom(
        event.deltaY > 0
          ? current.editorViewportZoom / EDITOR_VIEWPORT_WHEEL_ZOOM_FACTOR
          : current.editorViewportZoom * EDITOR_VIEWPORT_WHEEL_ZOOM_FACTOR,
      );

      if (floorWidth <= 0 || floorHeight <= 0) {
        setEditorViewportView({ pan: current.editorViewportPan, zoom: nextZoom });
        return;
      }

      const rect = element.getBoundingClientRect();
      const pointerX = event.clientX - rect.left;
      const pointerY = event.clientY - rect.top;
      const worldX = (pointerX - current.editorViewportPan.x) / current.editorViewportZoom;
      const worldY = (pointerY - current.editorViewportPan.y) / current.editorViewportZoom;

      setEditorViewportView({
        pan: clampEditorPan(
          { x: pointerX - worldX * nextZoom, y: pointerY - worldY * nextZoom },
          { width: floorWidth, height: floorHeight },
          getViewportSize(),
          nextZoom,
        ),
        zoom: nextZoom,
      });
    };

    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => element.removeEventListener('wheel', handleWheel);
  }, [floorWidth, floorHeight, getViewportSize, setEditorViewportView]);

  const changeZoom = useCallback((direction: 'in' | 'out') => {
    const current = useAppStore.getState();
    const nextZoom = clampEditorZoom(
      direction === 'in'
        ? current.editorViewportZoom * EDITOR_VIEWPORT_BUTTON_ZOOM_FACTOR
        : current.editorViewportZoom / EDITOR_VIEWPORT_BUTTON_ZOOM_FACTOR,
    );

    const viewport = getViewportSize();
    if (floorWidth <= 0 || floorHeight <= 0 || viewport.x === 0 || viewport.y === 0) {
      setEditorViewportView({ pan: current.editorViewportPan, zoom: nextZoom });
      return;
    }

    const centerX = viewport.x / 2;
    const centerY = viewport.y / 2;
    const worldX = (centerX - current.editorViewportPan.x) / current.editorViewportZoom;
    const worldY = (centerY - current.editorViewportPan.y) / current.editorViewportZoom;

    setEditorViewportView({
      pan: clampEditorPan(
        { x: centerX - worldX * nextZoom, y: centerY - worldY * nextZoom },
        { width: floorWidth, height: floorHeight },
        viewport,
        nextZoom,
      ),
      zoom: nextZoom,
    });
  }, [floorWidth, floorHeight, getViewportSize, setEditorViewportView]);

  const resetView = useCallback(() => {
    const viewport = getViewportSize();
    if (floorWidth <= 0 || floorHeight <= 0 || viewport.x === 0 || viewport.y === 0) {
      return;
    }

    setEditorViewportView(getEditorDefaultView({ width: floorWidth, height: floorHeight }, viewport));
  }, [floorWidth, floorHeight, getViewportSize, setEditorViewportView]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) {
      return;
    }

    // Node/object drags call stopPropagation on their own pointerdown, so
    // this only ever fires for a press on genuinely empty canvas. Capture is
    // deferred to handlePointerMove (only once real movement is detected)
    // rather than grabbed here, for the same reason the previous pan-only
    // hook deferred it: capturing a pointer from a trackpad/touch tap
    // retargets the compatibility click/dblclick events it synthesizes to
    // this element instead of whatever was actually under the finger.
    dragStateRef.current = {
      didMove: false,
      originPan: useAppStore.getState().editorViewportPan,
      pointerId: e.pointerId,
      start: { x: e.clientX, y: e.clientY },
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== e.pointerId) {
      return;
    }

    const dx = e.clientX - dragState.start.x;
    const dy = e.clientY - dragState.start.y;

    if (!dragState.didMove && Math.hypot(dx, dy) > EDITOR_VIEWPORT_DRAG_THRESHOLD) {
      dragState.didMove = true;
      suppressClickRef.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsPanning(true);
    }

    if (!dragState.didMove) {
      return;
    }

    const zoom = useAppStore.getState().editorViewportZoom;
    setEditorViewportView({
      pan: clampEditorPan(
        { x: dragState.originPan.x + dx, y: dragState.originPan.y + dy },
        { width: floorWidth, height: floorHeight },
        getViewportSize(),
        zoom,
      ),
      zoom,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== e.pointerId) {
      return;
    }

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    dragStateRef.current = null;
    setIsPanning(false);

    if (dragState.didMove) {
      // Deferred so the click event that follows this pointerup still sees
      // the flag as set (consumeSuppressedClick runs inside that click).
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
  };

  const consumeSuppressedClick = () => {
    if (!suppressClickRef.current) {
      return false;
    }

    suppressClickRef.current = false;
    return true;
  };

  return {
    changeZoom,
    consumeSuppressedClick,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    isPanning,
    pan: editorViewportPan,
    resetView,
    wrapperRef,
    zoom: editorViewportZoom,
  };
}
