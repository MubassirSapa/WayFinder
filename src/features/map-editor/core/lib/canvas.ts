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
