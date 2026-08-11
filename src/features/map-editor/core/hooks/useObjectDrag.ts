import React, { useRef } from 'react';
import { useAppStore } from "@/store";
import { clientPointToSvg, snapToGrid } from '../lib/canvas';

const MIN_OBJECT_SIZE = 20;

function normalizeRotation(rotation: number): number {
  const normalized = rotation % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

export function useObjectDrag() {
  const { mode, selectEntity, moveObject, rotateObject, updateObject } = useAppStore();
  const dragInfo = useRef<
    | {
        type: 'move';
        objectId: string;
        startX: number;
        startY: number;
        startClientX: number;
        startClientY: number;
        zoom: number;
      }
    | {
        type: 'rotate';
        objectId: string;
        centerX: number;
        centerY: number;
        svg: SVGSVGElement;
      }
    | {
        type: 'resize';
        objectId: string;
        startWidth: number;
        startHeight: number;
        startClientX: number;
        startClientY: number;
        zoom: number;
      }
    | null
  >(null);

  const handleMouseDown = (objectId: string, initialX: number, initialY: number, e: React.MouseEvent) => {
    if (mode !== 'select' || e.button !== 0) return;

    e.stopPropagation();
    e.preventDefault();

    // Select the dragged object
    selectEntity({ kind: 'object', id: objectId });

    dragInfo.current = {
      type: 'move',
      objectId,
      startX: initialX,
      startY: initialY,
      startClientX: e.clientX,
      startClientY: e.clientY,
      zoom: useAppStore.getState().editorViewportZoom,
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeStart = (
    objectId: string,
    width: number,
    height: number,
    e: React.MouseEvent<SVGRectElement>,
  ) => {
    if (mode !== 'select' || e.button !== 0) return;

    e.stopPropagation();
    e.preventDefault();

    selectEntity({ kind: 'object', id: objectId });

    dragInfo.current = {
      type: 'resize',
      objectId,
      startWidth: width,
      startHeight: height,
      startClientX: e.clientX,
      startClientY: e.clientY,
      zoom: useAppStore.getState().editorViewportZoom,
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleRotateStart = (
    objectId: string,
    objectX: number,
    objectY: number,
    width: number,
    height: number,
    e: React.MouseEvent<SVGCircleElement>,
  ) => {
    if (mode !== 'select' || e.button !== 0) return;

    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;

    e.stopPropagation();
    e.preventDefault();

    selectEntity({ kind: 'object', id: objectId });

    dragInfo.current = {
      type: 'rotate',
      objectId,
      centerX: objectX + width / 2,
      centerY: objectY + height / 2,
      svg,
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragInfo.current) return;

    if (dragInfo.current.type === 'move') {
      const { objectId, startX, startY, startClientX, startClientY, zoom } = dragInfo.current;

      // Client-pixel deltas live in screen space; the stored x/y are floor
      // (world) coordinates, so a delta has to be un-scaled by the canvas
      // zoom before it means the same distance in that space.
      const dx = (e.clientX - startClientX) / zoom;
      const dy = (e.clientY - startClientY) / zoom;

      const newX = snapToGrid(startX + dx);
      const newY = snapToGrid(startY + dy);

      moveObject(objectId, newX, newY);
      return;
    }

    if (dragInfo.current.type === 'resize') {
      const {
        objectId,
        startWidth,
        startHeight,
        startClientX,
        startClientY,
        zoom,
      } = dragInfo.current;

      const dx = (e.clientX - startClientX) / zoom;
      const dy = (e.clientY - startClientY) / zoom;

      const width = Math.max(MIN_OBJECT_SIZE, snapToGrid(startWidth + dx));
      const height = Math.max(MIN_OBJECT_SIZE, snapToGrid(startHeight + dy));

      updateObject(objectId, { width, height });
      return;
    }

    const { objectId, centerX, centerY, svg } = dragInfo.current;
    const point = clientPointToSvg(e.clientX, e.clientY, svg);
    if (!point) return;

    const angle = Math.atan2(point.y - centerY, point.x - centerX);
    const degrees = normalizeRotation((angle * 180) / Math.PI + 90);
    rotateObject(objectId, Math.round(degrees));
  };

  const handleMouseUp = () => {
    dragInfo.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return {
    handleMouseDown,
    handleResizeStart,
    handleRotateStart,
  };
}
