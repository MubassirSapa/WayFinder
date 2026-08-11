'use client';

import { EditorMapObject } from '../types/map.types';

interface MapObjectLabelViewProps {
  object: EditorMapObject;
}

// Rendered in a separate layer stacked above objects/edges/nodes (see
// MapObjectLabelLayer + MapCanvas) so a label stays legible even when a path
// edge or node crosses over its object - text baked into MapObjectView
// itself would sit at the objects layer's z-order and get covered.
export function MapObjectLabelView({ object }: MapObjectLabelViewProps) {
  const cx = object.width / 2;
  const cy = object.height / 2;

  return (
    <text
      transform={`translate(${object.x}, ${object.y}) rotate(${object.rotation || 0}, ${cx}, ${cy})`}
      x={cx}
      y={cy}
      textAnchor="middle"
      dominantBaseline="central"
      fill="var(--editor-canvas-label)"
      className="text-[10px] font-sans font-medium pointer-events-none select-none tracking-wide"
    >
      {object.label || object.name}
    </text>
  );
}
