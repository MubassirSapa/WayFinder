'use client';

import { useAppStore } from "@/store";
import { useFloorResizeDrag } from '../hooks/useFloorResizeDrag';
import type { Point } from '../lib/canvasViewport';

const BRACKET_LENGTH = 14;
const HIT_AREA_SIZE = 24;

interface FloorResizeHandleProps {
  floorHeight: number;
  floorWidth: number;
  isFloorEmpty: boolean;
  pan: Point;
  zoom: number;
}

// An L-shaped corner bracket hugging the floor's on-screen bottom-right
// corner, like a crop tool's corner marker. Rendered as a plain HTML
// element, sibling to the floor panel div rather than content inside its
// SVG - the panel clips to its own rounded corner via CSS `overflow-hidden`,
// so anything drawn inside it, at the edge or not, gets cut by that clip.
// Positioned from pan/zoom so its vertex tracks the floor's true corner
// exactly as the view pans and zooms.
export function FloorResizeHandle({ floorHeight, floorWidth, isFloorEmpty, pan, zoom }: FloorResizeHandleProps) {
  const mode = useAppStore((state) => state.mode);
  const { handleResizeStart } = useFloorResizeDrag();

  if (mode !== 'select') {
    return null;
  }

  const cornerX = pan.x + floorWidth * zoom;
  const cornerY = pan.y + floorHeight * zoom;

  return (
    <button
      aria-label="Resize floor"
      className="absolute z-10 flex items-end justify-end cursor-se-resize"
      onMouseDown={handleResizeStart}
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        height: HIT_AREA_SIZE,
        left: cornerX - HIT_AREA_SIZE,
        top: cornerY - HIT_AREA_SIZE,
        width: HIT_AREA_SIZE,
      }}
      title={
        isFloorEmpty
          ? 'Drag to resize the floor'
          : "Drag to resize the floor. Existing objects and nodes won't move with it."
      }
      type="button"
    >
      <svg className="pointer-events-none" height={BRACKET_LENGTH} width={BRACKET_LENGTH}>
        <path
          d={`M ${BRACKET_LENGTH} 0 L ${BRACKET_LENGTH} ${BRACKET_LENGTH} L 0 ${BRACKET_LENGTH}`}
          fill="none"
          stroke="var(--primary)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        />
      </svg>
    </button>
  );
}
