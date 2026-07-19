import React, { useRef } from 'react';

import { useEditorStore } from "@/store";

import { snapToGrid } from '../lib/canvas';

export function useNodeDrag() {
  const { mode, selectEntity, moveNode } = useEditorStore();
  const dragInfo = useRef<{
    nodeId: string;
    startX: number;
    startY: number;
    startClientX: number;
    startClientY: number;
    pointerId: number;
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
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!dragInfo.current) return;
    if (e.pointerId !== dragInfo.current.pointerId) return;

    const { nodeId, startX, startY, startClientX, startClientY } = dragInfo.current;

    const dx = e.clientX - startClientX;
    const dy = e.clientY - startClientY;

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
