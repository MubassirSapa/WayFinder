'use client';

import React from 'react';
import { useEditorStore } from "@/store";
import { useObjectDrag } from '../hooks/useObjectDrag';
import { getObjectColor } from '../lib/objectDefaults';
import { EditorMapObject } from '../types/map.types';

interface MapObjectViewProps {
  object: EditorMapObject;
}

export function MapObjectView({ object }: MapObjectViewProps) {
  const { selectedEntity, selectEntity, mode } = useEditorStore();
  const { handleMouseDown, handleResizeStart, handleRotateStart } = useObjectDrag();
  const canDragObject = mode === 'select' || mode === 'object';
  const canRotateObject = mode === 'select' || mode === 'object';
  const canResizeObject = mode === 'select' || mode === 'object';

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
        <>
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

          {canRotateObject ? (
            <>
              <line
                x1={cx}
                y1={-3}
                x2={cx}
                y2={-20}
                stroke="#3b82f6"
                strokeWidth="1.5"
                className="pointer-events-none"
              />
              <circle
                cx={cx}
                cy={-24}
                r="6"
                fill="#0f172a"
                stroke="#3b82f6"
                strokeWidth="1.5"
                onMouseDown={(e) =>
                  handleRotateStart(
                    object.id,
                    object.x,
                    object.y,
                    object.width,
                    object.height,
                    e,
                  )
                }
                className="cursor-alias"
              />
            </>
          ) : null}

          {canResizeObject ? (
            <>
              <line
                x1={object.width}
                y1={object.height}
                x2={object.width + 10}
                y2={object.height + 10}
                stroke="#3b82f6"
                strokeWidth="1.5"
                className="pointer-events-none"
              />
              <rect
                x={object.width + 6}
                y={object.height + 6}
                width="8"
                height="8"
                rx="2"
                fill="#0f172a"
                stroke="#3b82f6"
                strokeWidth="1.5"
                onMouseDown={(e) =>
                  handleResizeStart(object.id, object.width, object.height, e)
                }
                className="cursor-se-resize"
              />
            </>
          ) : null}
        </>
      )}
    </g>
  );
}
