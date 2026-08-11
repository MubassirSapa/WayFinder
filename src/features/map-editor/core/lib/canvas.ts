import { RefObject } from 'react';
import { Point } from './distance';
import type { EditorMapNode, EditorMapObject } from '../types/map.types';

export const GRID_SIZE = 20;

// Minimum pointer movement, in screen pixels, before a mousedown-then-move
// on an object/node counts as an intentional drag rather than incidental
// jitter during a click. Without this, moveObject/moveNode fire on literally
// any nonzero dx/dy - a plain click to re-select silently snaps the entity
// to the nearest grid line and re-dirties it, discarding a precise value
// just typed into the inspector.
export const DRAG_THRESHOLD = 6;

export function snapToGrid(value: number, gridSize: number = GRID_SIZE): number {
  return Math.round(value / gridSize) * gridSize;
}

export function canvasPointFromEvent(
  e: React.MouseEvent<SVGSVGElement> | MouseEvent,
  canvasRef: RefObject<SVGSVGElement | null>
): Point | null {
  if (!canvasRef.current) return null;

  const svg = canvasRef.current;
  const rect = svg.getBoundingClientRect();

  // If there's scaling/viewBox, we can get SVG coordinates by mapping client coordinates.
  // This is highly robust:
  const svgPoint = svg.createSVGPoint();
  svgPoint.x = e.clientX;
  svgPoint.y = e.clientY;

  try {
    const matrix = svg.getScreenCTM()?.inverse();
    if (matrix) {
      const transformed = svgPoint.matrixTransform(matrix);
      return { x: transformed.x, y: transformed.y };
    }
  } catch {
    // Fallback if CTM is not available
  }

  // Simple fallback
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

// Same conversion as canvasPointFromEvent, but for callers that already have
// the raw SVG element in hand (e.g. captured via a mousedown event's
// ownerSVGElement) rather than a canvasRef — used by drag hooks that aren't
// wired to the canvas component's ref.
export function clientPointToSvg(
  clientX: number,
  clientY: number,
  svg: SVGSVGElement,
): Point | null {
  const svgPoint = svg.createSVGPoint();
  svgPoint.x = clientX;
  svgPoint.y = clientY;

  try {
    const matrix = svg.getScreenCTM()?.inverse();
    if (matrix) {
      const transformed = svgPoint.matrixTransform(matrix);
      return { x: transformed.x, y: transformed.y };
    }
  } catch {
    // Fallback if CTM is not available
  }

  return null;
}

// An object's <g> renders its children in local, unrotated space, then
// applies translate(objectX, objectY) rotate(rotationDeg, cx, cy) on top. A
// point captured in SVG user-space (e.g. from a mouse drag) has to be run
// back through the inverse of that same transform to know where it landed
// in the object's local space — otherwise dragging a point on a rotated
// object would move it in the wrong direction.
// The smallest floor width/height that still contains every placed object
// and node, so a resize can be clamped from cutting existing content off.
// Uses each object's unrotated x/y/width/height (its bounding box before
// rotation is applied) rather than a true rotated bounding box - simpler,
// and only under-protects a corner of a heavily rotated object, which is an
// acceptable trade for a "safety" floor rather than an exact guarantee.
export function getFloorContentBounds(
  objects: EditorMapObject[],
  nodes: EditorMapNode[],
): { width: number; height: number } {
  let maxX = 0;
  let maxY = 0;

  for (const object of objects) {
    maxX = Math.max(maxX, object.x + object.width);
    maxY = Math.max(maxY, object.y + object.height);
  }

  for (const node of nodes) {
    maxX = Math.max(maxX, node.x);
    maxY = Math.max(maxY, node.y);
  }

  return { width: maxX, height: maxY };
}

export function toObjectLocalPoint(
  svgPoint: Point,
  objectX: number,
  objectY: number,
  rotationDeg: number,
  cx: number,
  cy: number,
): Point {
  const relX = svgPoint.x - objectX - cx;
  const relY = svgPoint.y - objectY - cy;
  const rad = (-rotationDeg * Math.PI) / 180;
  return {
    x: relX * Math.cos(rad) - relY * Math.sin(rad) + cx,
    y: relX * Math.sin(rad) + relY * Math.cos(rad) + cy,
  };
}
