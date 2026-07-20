'use client';

import React from 'react';
import { GRID_SIZE } from '../lib/canvas';

interface MapGridProps {
  width: number;
  height: number;
}

export function MapGrid({ width, height }: MapGridProps) {
  return (
    <>
      <defs>
        {/* Subtle grid pattern */}
        <pattern
          id="editor-grid"
          width={GRID_SIZE}
          height={GRID_SIZE}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`}
            fill="none"
            stroke="var(--editor-grid-minor)"
            strokeWidth="1"
          />
        </pattern>
        {/* Major grid lines for easier readability every 5 grid units */}
        <pattern
          id="editor-grid-major"
          width={GRID_SIZE * 5}
          height={GRID_SIZE * 5}
          patternUnits="userSpaceOnUse"
        >
          <rect width={GRID_SIZE * 5} height={GRID_SIZE * 5} fill="url(#editor-grid)" />
          <path
            d={`M ${GRID_SIZE * 5} 0 L 0 0 0 ${GRID_SIZE * 5}`}
            fill="none"
            stroke="var(--editor-grid-major)"
            strokeWidth="1.5"
          />
        </pattern>
      </defs>

      {/* Grid Background */}
      <rect
        width={width}
        height={height}
        fill="url(#editor-grid-major)"
        data-canvas-bg="true"
      />
    </>
  );
}
