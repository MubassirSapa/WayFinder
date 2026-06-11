'use client';

import React from 'react';
import { useEditorStore } from '../store';
import { useObjectDrag } from '../hooks/useObjectDrag';
import { getObjectColor } from '../lib/objectDefaults';
import { EditorMapObject } from '../types/map.types';

interface MapObjectViewProps {
  object: EditorMapObject;
}

export function MapObjectView({ object }: MapObjectViewProps) {
  const { selectedEntity, selectEntity, mode } = useEditorStore();
  const { handleMouseDown } = useObjectDrag();
  const canDragObject = mode === 'select' || mode === 'object';

  const isSelected = selectedEntity?.kind === 'object' && selectedEntity.id === object.id;
  const colors = getObjectColor(object.type);

  // Center of rotation
  const cx = object.width / 2;
  const cy = object.height / 2;

  const handlePointerDown = (e: React.MouseEvent) => {
    if (canDragObject) {
      handleMouseDown(object.id, object.x, object.y, e);
    } else {
      // If click-to-select in other mode
      e.stopPropagation();
      selectEntity({ kind: 'object', id: object.id });
    }
  };

  return (
    <g
      transform={`translate(${object.x}, ${object.y}) rotate(${object.rotation || 0}, ${cx}, ${cy})`}
      onMouseDown={handlePointerDown}
      className={`${canDragObject ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} transition-all`}
    >
      {/* Background shape */}
      <rect
        width={object.width}
        height={object.height}
        fill={colors.fill}
        stroke={isSelected ? '#3b82f6' : colors.stroke}
        strokeWidth={isSelected ? 2 : 1.5}
        rx={object.type === 'room' || object.type === 'washroom' || object.type === 'elevator' ? 6 : 2}
        className="transition-colors duration-150"
      />

      {/* Label/Name centered */}
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fill="rgba(255, 255, 255, 0.9)"
        className="text-[10px] font-sans font-medium pointer-events-none select-none tracking-wide"
      >
        {object.label || object.name}
      </text>

      {/* Selection outline */}
      {isSelected && (
        <rect
          width={object.width + 6}
          height={object.height + 6}
          x={-3}
          y={-3}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="1"
          strokeDasharray="3 3"
          rx={object.type === 'room' || object.type === 'washroom' || object.type === 'elevator' ? 9 : 4}
          className="pointer-events-none"
        />
      )}
    </g>
  );
}
