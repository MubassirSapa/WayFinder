import { RefObject } from 'react';
import { Point } from './distance';

export const GRID_SIZE = 20;

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
