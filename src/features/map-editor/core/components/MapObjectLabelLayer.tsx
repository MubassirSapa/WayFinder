'use client';

import { useAppStore } from "@/store";
import { MapObjectLabelView } from './MapObjectLabelView';

export function MapObjectLabelLayer() {
  const objectsMap = useAppStore((state) => state.objects);
  const objectsList = Object.values(objectsMap);

  return (
    <g id="object-labels-layer">
      {objectsList.map((obj) => (
        <MapObjectLabelView key={obj.id} object={obj} />
      ))}
    </g>
  );
}
