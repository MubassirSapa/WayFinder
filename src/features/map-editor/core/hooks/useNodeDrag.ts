import React, { useRef } from 'react';

import { useAppStore } from "@/store";

import { snapToGrid } from '../lib/canvas';

export function useNodeDrag() {
  const { mode, selectEntity, moveNode } = useAppStore();
  const dragInfo = useRef<{
    nodeId: string;
    startX: number;
    startY: number;
    startClientX: number;
    startClientY: number;
    pointerId: number;
    zoom: number;
  } | null>(null);

  const handlePointerDown = (
    nodeId: string,
    initialX: number,
    initialY: number,
    e: React.PointerEvent<SVGGElement>,
  ) => {
    if ((mode !== 'select' && mode !== 'node') || e.button !== 0) return;

    e.stopPropagation();
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);

    selectEntity({ kind: 'node', id: nodeId });

    dragInfo.current = {
      nodeId,
      startX: initialX,
      startY: initialY,
      startClientX: e.clientX,
      startClientY: e.clientY,
      pointerId: e.pointerId,
      // Captured once at drag start, not read live - the canvas can be
      // zoomed while a drag is in flight, and the delta below has to stay
      // consistent with whatever scale was in effect when the drag began.
      zoom: useAppStore.getState().editorViewportZoom,
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!dragInfo.current) return;
    if (e.pointerId !== dragInfo.current.pointerId) return;

    const { nodeId, startX, startY, startClientX, startClientY, zoom } = dragInfo.current;

    // Client-pixel deltas live in screen space; the stored x/y are floor
    // (world) coordinates, so a delta has to be un-scaled by the canvas
    // zoom before it means the same distance in that space.
    const dx = (e.clientX - startClientX) / zoom;
    const dy = (e.clientY - startClientY) / zoom;

    moveNode(nodeId, snapToGrid(startX + dx), snapToGrid(startY + dy));
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (!dragInfo.current || e.pointerId !== dragInfo.current.pointerId) return;

    dragInfo.current = null;
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);
    document.removeEventListener('pointercancel', handlePointerUp);
  };

  return {
    handlePointerDown,
  };
}
