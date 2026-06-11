export interface Point {
  x: number;
  y: number;
}

export function pixelDistance(a: Point, b: Point): number {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

export function pixelsToMeters(px: number, scale: number = 0.05): number {
  return Number((px * scale).toFixed(2));
}
