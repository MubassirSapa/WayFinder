import React, { useRef } from 'react';
import { useAppStore } from "@/store";
import { clientPointToSvg, toObjectLocalPoint } from '../lib/canvas';

interface ObjectPoint {
  x: number;
  y: number;
}

export function useObjectPointDrag() {
  const { mode, updateObject } = useAppStore();
  const dragInfo = useRef<{
    objectId: string;
    pointIndex: number;
    points: ObjectPoint[];
    objectX: number;
    objectY: number;
    rotation: number;
    cx: number;
    cy: number;
    svg: SVGSVGElement;
  } | null>(null);

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragInfo.current) return;
    const { objectId, pointIndex, points, objectX, objectY, rotation, cx, cy, svg } = dragInfo.current;

    const svgPoint = clientPointToSvg(e.clientX, e.clientY, svg);
    if (!svgPoint) return;

    const localPoint = toObjectLocalPoint(svgPoint, objectX, objectY, rotation, cx, cy);
    const nextPoints = points.map((point, index) => (index === pointIndex ? localPoint : point));

    dragInfo.current.points = nextPoints;
    updateObject(objectId, { points: nextPoints });
  };

  const handleMouseUp = () => {
    dragInfo.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const startDrag = (
    objectId: string,
    pointIndex: number,
    points: ObjectPoint[],
    objectX: number,
    objectY: number,
    rotation: number,
    cx: number,
    cy: number,
    svg: SVGSVGElement,
  ) => {
    dragInfo.current = { objectId, pointIndex, points, objectX, objectY, rotation, cx, cy, svg };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handlePointDragStart = (
    objectId: string,
    pointIndex: number,
    points: ObjectPoint[],
    objectX: number,
    objectY: number,
    rotation: number,
    cx: number,
    cy: number,
    e: React.MouseEvent<SVGCircleElement>,
  ) => {
    if (mode !== 'select' || e.button !== 0) return;
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;

    e.stopPropagation();
    e.preventDefault();

    startDrag(objectId, pointIndex, points, objectX, objectY, rotation, cx, cy, svg);
  };

  // Mousedown on an edge's midpoint handle: splice a new point into the
  // array right there, then immediately start dragging that new point — one
  // motion pulls a new corner out of the edge.
  const handleAddPointStart = (
    objectId: string,
    edgeIndex: number,
    points: ObjectPoint[],
    objectX: number,
    objectY: number,
    rotation: number,
    cx: number,
    cy: number,
    e: React.MouseEvent<SVGCircleElement>,
  ) => {
    if (mode !== 'select' || e.button !== 0) return;
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;

    e.stopPropagation();
    e.preventDefault();

    const a = points[edgeIndex];
    const b = points[(edgeIndex + 1) % points.length];
    const midpoint: ObjectPoint = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const nextPoints = [
      ...points.slice(0, edgeIndex + 1),
      midpoint,
      ...points.slice(edgeIndex + 1),
    ];
    const newPointIndex = edgeIndex + 1;

    updateObject(objectId, { points: nextPoints });
    startDrag(objectId, newPointIndex, nextPoints, objectX, objectY, rotation, cx, cy, svg);
  };

  return {
    handlePointDragStart,
    handleAddPointStart,
  };
}
