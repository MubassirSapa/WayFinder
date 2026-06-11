'use client';

import { useEditorStore } from "@/store";
import { useCanvasPointer } from '../hooks/useCanvasPointer';
import { EditorMapNode } from '../types/map.types';

interface MapNodeViewProps {
  node: EditorMapNode;
}

export function MapNodeView({ node }: MapNodeViewProps) {
  const { selectedEntity, pendingPathNodeId, mode } = useEditorStore();
  const { handleNodeClick } = useCanvasPointer({ current: null });

  const isSelected = selectedEntity?.kind === 'node' && selectedEntity.id === node.id;
  const isPendingSource = pendingPathNodeId === node.id;

  // Node color depending on role
  let fillColor = '#3b82f6'; // blue-500 for hallway_point
  if (node.role === 'entrance') fillColor = '#22c55e'; // green-500
  if (node.role === 'exit') fillColor = '#ef4444'; // red-500
  if (node.role === 'stairs_entry') fillColor = '#f97316'; // orange-500
  if (node.role === 'elevator_entry') fillColor = '#a855f7'; // purple-500
  if (node.role === 'shelf_access') fillColor = '#14b8a6'; // teal-500

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      onClick={(e) => handleNodeClick(node.id, e)}
      className="cursor-pointer group"
    >
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

      {/* Label overlay above node */}
      <text
        y="-12"
        textAnchor="middle"
        fill="#f4f4f5"
        className="text-[9px] font-sans font-medium pointer-events-none select-none tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
      >
        {node.label}
      </text>
    </g>
  );
}
