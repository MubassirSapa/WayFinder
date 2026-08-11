import { useRef } from 'react';
import { useAppStore } from "@/store";

// Drags the reference image's position (backgroundImageOffsetX/Y), mirroring
// useObjectDrag's "move" case: client-pixel deltas, un-scaled by the current
// canvas zoom (captured once at drag start), added to the stored offset -
// same coordinate assumption the rest of the canvas relies on for dragging
// objects/nodes.
export function useBackgroundImageDrag() {
  const { mode, floor, updateFloor } = useAppStore();
  const dragInfo = useRef<{
    startOffsetX: number;
    startOffsetY: number;
    startClientX: number;
    startClientY: number;
    zoom: number;
  } | null>(null);

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragInfo.current) return;
    const { startOffsetX, startOffsetY, startClientX, startClientY, zoom } = dragInfo.current;
    updateFloor({
      backgroundImageOffsetX: startOffsetX + (e.clientX - startClientX) / zoom,
      backgroundImageOffsetY: startOffsetY + (e.clientY - startClientY) / zoom,
    });
  };

  const handleMouseUp = () => {
    dragInfo.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (mode !== 'select' || e.button !== 0 || !floor || floor.backgroundImageLocked) return;

    e.stopPropagation();
    e.preventDefault();

    dragInfo.current = {
      startOffsetX: floor.backgroundImageOffsetX ?? 0,
      startOffsetY: floor.backgroundImageOffsetY ?? 0,
      startClientX: e.clientX,
      startClientY: e.clientY,
      zoom: useAppStore.getState().editorViewportZoom,
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return { handleMouseDown };
}
