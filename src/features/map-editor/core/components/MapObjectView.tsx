'use client';

import React from 'react';
import { useAppStore } from "@/store";
import { useObjectDrag } from '../hooks/useObjectDrag';
import { useObjectPointDrag } from '../hooks/useObjectPointDrag';
import { defaultPolygonPoints, getObjectColor } from '../lib/objectDefaults';
import { EditorMapObject } from '../types/map.types';

interface MapObjectViewProps {
  object: EditorMapObject;
}

export function MapObjectView({ object }: MapObjectViewProps) {
  const { selectedEntity, selectEntity, mode } = useAppStore();
  const { handleMouseDown, handleResizeStart, handleRotateStart } = useObjectDrag();
  const { handlePointDragStart, handleAddPointStart } = useObjectPointDrag();
  // "object" mode is exclusively for placing new objects from the toolbox —
  // existing objects are select-only there (see handlePointerDown below) so
  // nothing gets accidentally dragged while you're aiming a placement.
  // Moving/resizing/rotating what's already on the map is "select" mode's job.
  const canDragObject = mode === 'select';
  const canRotateObject = mode === 'select';
  const isPolygon = object.shape === 'polygon';
  const canResizeObject = mode === 'select' && !isPolygon;
  const canEditPoints = mode === 'select' && isPolygon;

  const isSelected = selectedEntity?.kind === 'object' && selectedEntity.id === object.id;
  const colors = getObjectColor(object.type);

  // Center of rotation — stays derived from the bounding box even for a
  // polygon shape, so the pivot doesn't jump around as points are edited.
  const cx = object.width / 2;
  const cy = object.height / 2;
  const polygonPoints = isPolygon
    ? (object.points?.length ?? 0) >= 3
      ? object.points!
      : defaultPolygonPoints(object.width, object.height)
    : null;

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
      // The canvas wrapper starts a pan-drag on any pointerdown that reaches
      // it. mousedown/pointerdown are separate native events — stopping
      // propagation on the mouse event above does NOT stop the pointerdown
      // that fires first and bubbles independently, so without this every
      // object drag also panned the whole canvas underneath it.
      onPointerDown={(e) => e.stopPropagation()}
      className={`${canDragObject ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} transition-all`}
    >
      {/* Background shape */}
      {isPolygon ? (
        <polygon
          points={polygonPoints!.map((point) => `${point.x},${point.y}`).join(' ')}
          fill={colors.fill}
          stroke={isSelected ? 'var(--editor-selection)' : colors.stroke}
          strokeWidth={isSelected ? 2 : 1.5}
          className="transition-colors duration-150"
        />
      ) : object.shape === 'ellipse' ? (
        <ellipse
          cx={cx}
          cy={cy}
          rx={cx}
          ry={cy}
          fill={colors.fill}
          stroke={isSelected ? 'var(--editor-selection)' : colors.stroke}
          strokeWidth={isSelected ? 2 : 1.5}
          className="transition-colors duration-150"
        />
      ) : (
        <rect
          width={object.width}
          height={object.height}
          fill={colors.fill}
          stroke={isSelected ? 'var(--editor-selection)' : colors.stroke}
          strokeWidth={isSelected ? 2 : 1.5}
          className="transition-colors duration-150"
        />
      )}

      {/* Label/Name centered - rendered separately in MapObjectLabelLayer,
          stacked above edges/nodes so it stays legible over anything that
          crosses this object. */}

      {/* Selection outline */}
      {isSelected && (
        <>
          <rect
            width={object.width + 6}
            height={object.height + 6}
            x={-3}
            y={-3}
            fill="none"
            stroke="var(--editor-selection)"
            strokeWidth="1"
            strokeDasharray="3 3"
            className="pointer-events-none"
          />

          {canRotateObject ? (
            <>
              <line
                x1={cx}
                y1={-3}
                x2={cx}
                y2={-20}
                stroke="var(--editor-selection)"
                strokeWidth="1.5"
                className="pointer-events-none"
              />
              <circle
                cx={cx}
                cy={-24}
                r="6"
                fill="var(--editor-canvas-label-inverse)"
                stroke="var(--editor-selection)"
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
                stroke="var(--editor-selection)"
                strokeWidth="1.5"
                className="pointer-events-none"
              />
              <rect
                x={object.width + 6}
                y={object.height + 6}
                width="8"
                height="8"
                rx="2"
                fill="var(--editor-canvas-label-inverse)"
                stroke="var(--editor-selection)"
                strokeWidth="1.5"
                onMouseDown={(e) =>
                  handleResizeStart(object.id, object.width, object.height, e)
                }
                className="cursor-se-resize"
              />
            </>
          ) : null}

          {canEditPoints && polygonPoints ? (
            <>
              {polygonPoints.map((point, index) => {
                const next = polygonPoints[(index + 1) % polygonPoints.length];
                const midpoint = { x: (point.x + next.x) / 2, y: (point.y + next.y) / 2 };

                return (
                  <React.Fragment key={index}>
                    <circle
                      cx={midpoint.x}
                      cy={midpoint.y}
                      r="4"
                      fill="var(--editor-canvas-label-inverse)"
                      stroke="var(--editor-selection)"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                      onMouseDown={(e) =>
                        handleAddPointStart(
                          object.id,
                          index,
                          polygonPoints,
                          object.x,
                          object.y,
                          object.rotation || 0,
                          cx,
                          cy,
                          e,
                        )
                      }
                      className="cursor-copy"
                    />
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="5"
                      fill="var(--editor-canvas-label-inverse)"
                      stroke="var(--editor-selection)"
                      strokeWidth="2"
                      onMouseDown={(e) =>
                        handlePointDragStart(
                          object.id,
                          index,
                          polygonPoints,
                          object.x,
                          object.y,
                          object.rotation || 0,
                          cx,
                          cy,
                          e,
                        )
                      }
                      className="cursor-move"
                    />
                  </React.Fragment>
                );
              })}
            </>
          ) : null}
        </>
      )}
    </g>
  );
}
