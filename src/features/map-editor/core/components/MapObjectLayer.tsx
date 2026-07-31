'use client';

import { useAppStore } from "@/store";
import { MapObjectView } from './MapObjectView';

export function MapObjectLayer() {
  const objectsMap = useAppStore((state) => state.objects);
  const objectsList = Object.values(objectsMap);

  return (
    <g id="objects-layer" className="pointer-events-auto">
      {objectsList.map((obj) => (
        <MapObjectView key={obj.id} object={obj} />
      ))}
    </g>
  );
}
