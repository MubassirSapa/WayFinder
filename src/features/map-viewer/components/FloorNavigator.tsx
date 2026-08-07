"use client";

import type { ViewerFloor } from "../types/map-viewer.types";
import { FloorWheel } from "./FloorWheel";

interface FloorNavigatorProps {
  activeFloor: ViewerFloor;
  floors: ViewerFloor[];
  onFloorChange: (floorId: string) => void;
}

// Shows each floor's plain level number, not its name - matching a real
// elevator panel / duration-wheel, not a labeled list.
export function FloorNavigator({ activeFloor, floors, onFloorChange }: FloorNavigatorProps) {
  const activeIndex = floors.findIndex((floor) => floor.id === activeFloor.id);
  const items = floors.map((floor) => ({ key: floor.id, label: String(floor.level) }));

  if (activeIndex === -1) {
    return null;
  }

  return (
    <FloorWheel
      activeIndex={activeIndex}
      ariaLabel="Floor navigation"
      items={items}
      onChange={(index) => {
        const floor = floors[index];
        if (floor) {
          onFloorChange(floor.id);
        }
      }}
    />
  );
}
