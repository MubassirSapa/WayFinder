import { useRef } from 'react';
import { useAppStore } from "@/store";
import { getFloorContentBounds, snapToGrid } from '../lib/canvas';

const MIN_FLOOR_SIZE = 200;

// Mirrors useObjectDrag's "resize" case: client-pixel deltas, un-scaled by
// the zoom captured at drag start, added to the floor's own width/height.
// Deliberately does not touch any object/node/edge x/y - instead, the floor
// can never shrink smaller than getFloorContentBounds() already needs to
// hold everything currently placed, so existing entities can't be resized
// out of the visible canvas (see FloorResizeHandle's tooltip, which still
// warns that they won't move to a *better* spot within the new bounds).
export function useFloorResizeDrag() {
  const { mode, floor, objects, nodes, updateFloor } = useAppStore();
  const dragInfo = useRef<{
    startWidth: number;
    startHeight: number;
    startClientX: number;
    startClientY: number;
    zoom: number;
    minWidth: number;
    minHeight: number;
  } | null>(null);

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragInfo.current) return;
    const { startWidth, startHeight, startClientX, startClientY, zoom, minWidth, minHeight } = dragInfo.current;

    const dx = (e.clientX - startClientX) / zoom;
    const dy = (e.clientY - startClientY) / zoom;

    const width = Math.max(MIN_FLOOR_SIZE, minWidth, snapToGrid(startWidth + dx));
    const height = Math.max(MIN_FLOOR_SIZE, minHeight, snapToGrid(startHeight + dy));

    updateFloor({ width, height });
  };

  const handleMouseUp = () => {
    dragInfo.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    useAppStore.getState().setIsResizingFloor(false);
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    if (mode !== 'select' || e.button !== 0 || !floor) return;

    e.stopPropagation();
    e.preventDefault();

    const contentBounds = getFloorContentBounds(Object.values(objects), Object.values(nodes));

    dragInfo.current = {
      startWidth: floor.width,
      startHeight: floor.height,
      startClientX: e.clientX,
      startClientY: e.clientY,
      zoom: useAppStore.getState().editorViewportZoom,
      minWidth: contentBounds.width,
      minHeight: contentBounds.height,
    };
    useAppStore.getState().setIsResizingFloor(true);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return { handleResizeStart };
}
