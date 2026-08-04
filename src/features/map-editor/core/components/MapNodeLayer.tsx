'use client';

import { useAppStore } from "@/store";
import { MapNodeView } from "./MapNodeView";

export function MapNodeLayer() {
  const nodesMap = useAppStore((state) => state.nodes);
  const nodesList = Object.values(nodesMap);

  return (
    <g id="nodes-layer">
      {nodesList.map((node) => (
        <MapNodeView key={node.id} node={node} />
      ))}
    </g>
  );
}
