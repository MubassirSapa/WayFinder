'use client';


import { useEditorStore } from "@/store";

export function PathEdgeLayer() {
  const edgesMap = useEditorStore((state) => state.edges);
  const { nodes, selectedEntity, selectEntity } = useEditorStore();

  const edgesList = Object.values(edgesMap);

  return (
    <g id="edges-layer">
      {/* Markers for directed/one-way paths */}
      <defs>
        <marker
          id="edge-arrow"
          viewBox="0 0 10 10"
          refX="22" // offset to stop before node center (radius is ~6)
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#71717a" />
        </marker>
        <marker
          id="edge-arrow-selected"
          viewBox="0 0 10 10"
          refX="22"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3b82f6" />
        </marker>
      </defs>

      {edgesList.map((edge) => {
        const fromNode = nodes[edge.fromNodeId];
        const toNode = nodes[edge.toNodeId];

        if (!fromNode || !toNode) return null;

        const isSelected = selectedEntity?.kind === 'edge' && selectedEntity.id === edge.id;

        // Determine edge color based on connection type
        let strokeColor = '#71717a'; // zinc-400 for walkway
        if (edge.type === 'stairs') strokeColor = '#f97316'; // orange-500
        if (edge.type === 'elevator') strokeColor = '#a855f7'; // purple-500
        if (edge.type === 'ramp') strokeColor = '#22c55e'; // green-500

        // If selected, override color
        const color = isSelected ? '#3b82f6' : strokeColor;

        return (
          <g key={edge.id} className="group">
            {/* Wide, invisible interaction line for ease of clicking */}
            <line
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke="transparent"
              strokeWidth="14"
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                selectEntity({ kind: 'edge', id: edge.id });
              }}
            />

            {/* Visual Line */}
            <line
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke={color}
              strokeWidth={isSelected ? '3.5' : '2.5'}
              strokeDasharray={edge.type === 'stairs' ? '3 3' : undefined}
              markerEnd={!edge.bidirectional ? (isSelected ? 'url(#edge-arrow-selected)' : 'url(#edge-arrow)') : undefined}
              className="pointer-events-none transition-all duration-150 group-hover:stroke-blue-400"
            />
          </g>
        );
      })}
    </g>
  );
}
