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
  // `floors` comes in level-ascending (matches the server sort); reversed
  // here so the wheel mimics a real building - a higher floor renders above
  // a lower one. This reversal belongs here, not in FloorWheel: it's only
  // valid because floor-browsing order is always level-ascending. Don't move
  // it into the shared component - RouteFloorSelect's items follow real
  // route-traversal order instead, which isn't guaranteed ascending.
  const orderedFloors = [...floors].reverse();
  const activeIndex = orderedFloors.findIndex((floor) => floor.id === activeFloor.id);
  const items = orderedFloors.map((floor) => ({ key: floor.id, label: String(floor.level) }));

  if (activeIndex === -1) {
    return null;
  }

  return (
    <FloorWheel
      activeIndex={activeIndex}
      ariaLabel="Floor navigation"
      items={items}
      onChange={(index) => {
        const floor = orderedFloors[index];
        if (floor) {
          onFloorChange(floor.id);
        }
      }}
    />
  );
}
