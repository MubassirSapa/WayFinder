import React, { useRef } from 'react';
import { useEditorStore } from '../store';
import { snapToGrid } from '../lib/canvas';

export function useObjectDrag() {
  const { mode, selectEntity, moveObject } = useEditorStore();
  const dragInfo = useRef<{
    objectId: string;
    startX: number;
    startY: number;
    startClientX: number;
    startClientY: number;
  } | null>(null);

  const handleMouseDown = (objectId: string, initialX: number, initialY: number, e: React.MouseEvent) => {
    // Support moving objects from both select and object placement modes.
    if ((mode !== 'select' && mode !== 'object') || e.button !== 0) return;

    e.stopPropagation();
    e.preventDefault();

    // Select the dragged object
    selectEntity({ kind: 'object', id: objectId });

    dragInfo.current = {
      objectId,
      startX: initialX,
      startY: initialY,
      startClientX: e.clientX,
      startClientY: e.clientY,
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragInfo.current) return;

    const { objectId, startX, startY, startClientX, startClientY } = dragInfo.current;

    const dx = e.clientX - startClientX;
    const dy = e.clientY - startClientY;

    // Apply live snapping for high-fidelity interactive feel
    const newX = snapToGrid(startX + dx);
    const newY = snapToGrid(startY + dy);

    moveObject(objectId, newX, newY);
  };

  const handleMouseUp = () => {
    dragInfo.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return {
    handleMouseDown,
  };
}
