import { useRef, useState } from 'react';
import type { RefObject } from 'react';

const DRAG_THRESHOLD = 6;
// Minimum sliver of the floor kept on-screen at the extremes of a pan, so
// you can never drag the whole floor plan out of view with no way back.
const MIN_VISIBLE_PX = 100;

interface UseCanvasPanArgs {
  floorHeight: number;
  floorWidth: number;
  wrapperRef: RefObject<HTMLDivElement | null>;
}

export function useCanvasPan({ floorHeight, floorWidth, wrapperRef }: UseCanvasPanArgs) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const suppressClickRef = useRef(false);
  const dragStateRef = useRef<{
    didMove: boolean;
    originPan: { x: number; y: number };
    pointerId: number;
    start: { x: number; y: number };
  } | null>(null);

  const clampPan = (nextPan: { x: number; y: number }) => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) {
      return nextPan;
    }

    const minX = MIN_VISIBLE_PX - floorWidth;
    const maxX = rect.width - MIN_VISIBLE_PX;
    const minY = MIN_VISIBLE_PX - floorHeight;
    const maxY = rect.height - MIN_VISIBLE_PX;

    return {
      x: Math.min(maxX, Math.max(minX, nextPan.x)),
      y: Math.min(maxY, Math.max(minY, nextPan.y)),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) {
      return;
    }

    // Node/object drags call stopPropagation on their own pointerdown, so
    // this only ever fires for a press on genuinely empty canvas. Capture is
    // deferred to handlePointerMove (only once real movement is detected)
    // rather than grabbed here — capturing a pointer that came from a
    // trackpad/touch tap retargets the *compatibility* click/dblclick events
    // the browser synthesizes from it to this element instead of whatever
    // was actually under the finger, which silently broke double-tap object
    // placement (its dblclick handler lives on the SVG, a descendant).
    dragStateRef.current = {
      didMove: false,
      originPan: pan,
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

    if (!dragState.didMove && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
      dragState.didMove = true;
      suppressClickRef.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsPanning(true);
    }

    if (!dragState.didMove) {
      return;
    }

    setPan(clampPan({ x: dragState.originPan.x + dx, y: dragState.originPan.y + dy }));
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
    consumeSuppressedClick,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    isPanning,
    pan,
  };
}
