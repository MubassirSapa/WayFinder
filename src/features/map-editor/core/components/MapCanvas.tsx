'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useEditorStore } from "@/store";
import { useCanvasPointer } from '../hooks/useCanvasPointer';
import { MapGrid } from './MapGrid';
import { MapNodeLayer } from './MapNodeLayer';
import { MapObjectLayer } from './MapObjectLayer';
import { PathEdgeLayer } from './PathEdgeLayer';


export function MapCanvas() {
  const canvasRef = useRef<SVGSVGElement | null>(null);
  const { floor, mode, pendingPathNodeId, nodes } = useEditorStore();
  const { handleCanvasClick, handleCanvasDoubleClick } = useCanvasPointer(canvasRef);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Track cursor position in path mode to render temporary edge preview
  useEffect(() => {
    if (mode !== 'path' || !pendingPathNodeId) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      
      // Map screen coords to SVG coords
      const svg = canvasRef.current;
      const svgPoint = svg.createSVGPoint();
      svgPoint.x = e.clientX;
      svgPoint.y = e.clientY;

      try {
        const matrix = svg.getScreenCTM()?.inverse();
        if (matrix) {
          const transformed = svgPoint.matrixTransform(matrix);
          setMousePos({ x: transformed.x, y: transformed.y });
          return;
        }
      } catch {}

      // Fallback
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mode, pendingPathNodeId]);

  if (!floor) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-950 text-zinc-400">
        <p>No floor data loaded.</p>
      </div>
    );
  }

  // Find source node coordinates for drawing path preview line
  const sourceNode = pendingPathNodeId ? nodes[pendingPathNodeId] : null;

  return (
    <div className="relative h-full w-full overflow-auto bg-zinc-950 p-6 flex items-start justify-start select-none">
      <div
        className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl"
        style={{
          width: floor.width,
          height: floor.height,
        }}
      >
        <svg
          ref={canvasRef}
          width={floor.width}
          height={floor.height}
          onClick={handleCanvasClick}
          onDoubleClick={handleCanvasDoubleClick}
          data-editor-canvas="true"
          className="absolute inset-0 select-none cursor-crosshair overflow-hidden"
        >
          {/* Faded Background Image if configured */}
          {floor.backgroundImageUrl && (
            <image
              href={floor.backgroundImageUrl}
              width={floor.width}
              height={floor.height}
              opacity={0.3}
              style={{ pointerEvents: 'none' }}
            />
          )}

          {/* Canvas grid background */}
          <MapGrid width={floor.width} height={floor.height} />

          {/* Render Path Edges */}
          <PathEdgeLayer />

          {/* Render Active Temporary Line (Edge preview under construction) */}
          {mode === 'path' && sourceNode && (
            <line
              x1={sourceNode.x}
              y1={sourceNode.y}
              x2={mousePos.x}
              y2={mousePos.y}
              stroke="rgba(234, 179, 8, 0.6)"
              strokeWidth="2"
              strokeDasharray="4 4"
              className="pointer-events-none"
            />
          )}

          {/* Render Map Objects */}
          <MapObjectLayer />

          {/* Render Navigation Nodes */}
          <MapNodeLayer />
        </svg>
      </div>
    </div>
  );
}
