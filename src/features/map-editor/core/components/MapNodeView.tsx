'use client';

import { useAppStore } from "@/store";
import { useCanvasPointer } from '../hooks/useCanvasPointer';
import { useNodeDrag } from '../hooks/useNodeDrag';
import { EditorMapNode } from '../types/map.types';

interface MapNodeViewProps {
  node: EditorMapNode;
}

export function MapNodeView({ node }: MapNodeViewProps) {
  const { selectedEntity, pendingPathNodeId, mode } = useAppStore();
  const { handleNodeClick } = useCanvasPointer({ current: null });
  const { handlePointerDown } = useNodeDrag();

  const isSelected = selectedEntity?.kind === 'node' && selectedEntity.id === node.id;
  const isPendingSource = pendingPathNodeId === node.id;
  // "object" mode is exclusively for placing new objects — it ignores
  // existing nodes entirely, same reasoning as MapObjectView.
  const canDragNode = mode === 'select' || mode === 'node';

  // Node color depending on role
  let fillColor = 'var(--editor-selection)'; // blue-500 for hallway_point
  if (node.role === 'entrance') fillColor = 'var(--editor-node-entrance)'; // green-500
  if (node.role === 'exit') fillColor = 'var(--editor-object-exit)'; // red-500
  if (node.role === 'stairs_entry') fillColor = 'var(--editor-object-stairs)'; // orange-500
  if (node.role === 'elevator_entry') fillColor = 'var(--editor-object-elevator)'; // purple-500
  if (node.role === 'escalator_entry') fillColor = 'var(--editor-object-escalator)'; // sky-500
  if (node.role === 'shelf_access') fillColor = 'var(--editor-object-shelf)'; // teal-500

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      onPointerDown={(e) => {
        if (canDragNode) {
          handlePointerDown(node.id, node.x, node.y, e);
        } else {
          // Still stop the pointerdown from reaching the canvas wrapper's
          // pan handler even when this node isn't draggable right now —
          // otherwise a plain select-click on a node could get suppressed
          // as an accidental pan (same reasoning as MapObjectView).
          e.stopPropagation();
        }
      }}
      onClick={(e) => handleNodeClick(node.id, e)}
      className={`${canDragNode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} group`}
      style={{ touchAction: 'none' }}
    >
      {/* Larger invisible hit target so nodes are easy to grab on mouse/touch. */}
      <circle
        r="22"
        fill="transparent"
      />

      {/* Outer focus rings for selection or path creation source */}
      {isPendingSource && (
        <circle
          r="14"
          fill="none"
          stroke="var(--editor-object-door)"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          className="animate-spin"
          style={{ animationDuration: '6s' }}
        />
      )}

      {isSelected && (
        <circle
          r="11"
          fill="none"
          stroke="var(--editor-selection)"
          strokeWidth="2"
        />
      )}

      {/* Hover background halo */}
      <circle
        r="14"
        fill="transparent"
        className="group-hover:fill-foreground/10 transition-colors duration-150"
      />

      {/* Main Node Point */}
      <circle
        r={isPendingSource || isSelected ? '6' : '5.5'}
        fill={fillColor}
        stroke="var(--editor-background)"
        strokeWidth="1.5"
        className="transition-transform duration-150 group-hover:scale-110 shadow-lg"
      />

      {/* Label overlay above node — hidden by default (dozens of nodes with
          permanent text turns the canvas into visual noise); shown on hover
          or while selected, when you actually need to identify one. */}
      {node.label ? (
        <text
          y="-12"
          textAnchor="middle"
          fill="var(--editor-foreground)"
          className={`text-[9px] font-sans font-medium pointer-events-none select-none tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] transition-opacity duration-150 ${
            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          {node.label}
        </text>
      ) : null}
    </g>
  );
}
