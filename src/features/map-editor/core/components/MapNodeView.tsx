'use client';

import { useEditorStore } from "@/store";
import { useCanvasPointer } from '../hooks/useCanvasPointer';
import { useNodeDrag } from '../hooks/useNodeDrag';
import { EditorMapNode } from '../types/map.types';

interface MapNodeViewProps {
  node: EditorMapNode;
}

export function MapNodeView({ node }: MapNodeViewProps) {
  const { selectedEntity, pendingPathNodeId, mode } = useEditorStore();
  const { handleNodeClick } = useCanvasPointer({ current: null });
  const { handlePointerDown } = useNodeDrag();

  const isSelected = selectedEntity?.kind === 'node' && selectedEntity.id === node.id;
  const isPendingSource = pendingPathNodeId === node.id;
  const canDragNode = mode === 'select' || mode === 'node' || mode === 'object';

  // Node color depending on role
  let fillColor = '#3b82f6'; // blue-500 for hallway_point
  if (node.role === 'entrance') fillColor = '#22c55e'; // green-500
  if (node.role === 'exit') fillColor = '#ef4444'; // red-500
  if (node.role === 'stairs_entry') fillColor = '#f97316'; // orange-500
  if (node.role === 'elevator_entry') fillColor = '#a855f7'; // purple-500
  if (node.role === 'escalator_entry') fillColor = '#0ea5e9'; // sky-500
  if (node.role === 'shelf_access') fillColor = '#14b8a6'; // teal-500

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      onPointerDown={(e) => {
        if (canDragNode) {
          handlePointerDown(node.id, node.x, node.y, e);
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
          stroke="#eab308"
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
          stroke="#3b82f6"
          strokeWidth="2"
        />
      )}

      {/* Hover background halo */}
      <circle
        r="14"
        fill="transparent"
        className="group-hover:fill-white/10 transition-colors duration-150"
      />

      {/* Main Node Point */}
      <circle
        r={isPendingSource || isSelected ? '6' : '5.5'}
        fill={fillColor}
        stroke="#18181b"
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
          fill="#f4f4f5"
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
