'use client';

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { canvasPointFromEvent, snapToGrid } from "@/features/map-editor/core/lib/canvas";
import { useAppStore } from "@/store";

export function SmartBuilderBridge() {
  const {
    floor,
    mode,
    objects,
    isSmartBuilderEnabled,
    autoCreateNodes,
    autoConnectNodes,
    hallwayDrawingPoints,
    addHallwayDrawingPoint,
    clearHallwayDrawingPoints,
    applySmartBuilderToObject,
  } = useAppStore();

  const processedObjectIdsRef = useRef<Set<string>>(new Set());
  const activeFloorIdRef = useRef<string | null>(null);
  const canvasElement =
    typeof document === "undefined"
      ? null
      : document.querySelector<SVGSVGElement>('[data-editor-canvas="true"]');

  useEffect(() => {
    const currentFloorId = floor?.id ?? null;

    if (activeFloorIdRef.current !== currentFloorId) {
      activeFloorIdRef.current = currentFloorId;
      processedObjectIdsRef.current = new Set(Object.keys(objects));
      clearHallwayDrawingPoints();
      return;
    }

    if (!isSmartBuilderEnabled || (!autoCreateNodes && !autoConnectNodes)) {
      processedObjectIdsRef.current = new Set(Object.keys(objects));
      return;
    }

    const knownObjectIds = processedObjectIdsRef.current;

    for (const objectId of Object.keys(objects)) {
      if (knownObjectIds.has(objectId)) {
        continue;
      }

      knownObjectIds.add(objectId);
      applySmartBuilderToObject(objectId);
    }
  }, [
    floor?.id,
    objects,
    isSmartBuilderEnabled,
    autoCreateNodes,
    autoConnectNodes,
    clearHallwayDrawingPoints,
    applySmartBuilderToObject,
  ]);

  useEffect(() => {
    const editorCanvas = document.querySelector<SVGSVGElement>(
      '[data-editor-canvas="true"]',
    );

    if (!editorCanvas) {
      return;
    }

    const handleCanvasClick = (event: MouseEvent) => {
      if (!isSmartBuilderEnabled || mode !== "path") {
        return;
      }

      const clickedElement = event.target as EventTarget | null;
      const clickedCanvasBackground =
        clickedElement instanceof Element &&
        clickedElement.closest('[data-canvas-bg="true"]') !== null;

      if (event.target !== editorCanvas && !clickedCanvasBackground) {
        return;
      }

      const point = canvasPointFromEvent(event, { current: editorCanvas });
      if (!point) {
        return;
      }

      addHallwayDrawingPoint({
        x: snapToGrid(point.x),
        y: snapToGrid(point.y),
      });
    };

    editorCanvas.addEventListener("click", handleCanvasClick);

    return () => {
      editorCanvas.removeEventListener("click", handleCanvasClick);
    };
  }, [mode, isSmartBuilderEnabled, addHallwayDrawingPoint]);

  if (!canvasElement || hallwayDrawingPoints.length === 0) {
    return null;
  }

  const pathPoints = hallwayDrawingPoints.map((point) => `${point.x},${point.y}`).join(" ");

  return createPortal(
    <g className="pointer-events-none">
      {hallwayDrawingPoints.length > 1 ? (
        <polyline
          points={pathPoints}
          fill="none"
          stroke="var(--editor-smart-builder)"
          strokeWidth="3"
          strokeDasharray="6 4"
        />
      ) : null}
      {hallwayDrawingPoints.map((point, index) => (
        <g key={`${point.x}-${point.y}-${index}`}>
          <circle
            cx={point.x}
            cy={point.y}
            r="7"
            fill="var(--editor-smart-builder-fill)"
            stroke="var(--editor-smart-builder)"
            strokeWidth="1.5"
          />
          <text
            x={point.x}
            y={point.y - 12}
            textAnchor="middle"
            fill="var(--editor-canvas-label-inverse)"
            className="text-[9px] font-medium"
          >
            {index + 1}
          </text>
        </g>
      ))}
    </g>,
    canvasElement,
  );
}
