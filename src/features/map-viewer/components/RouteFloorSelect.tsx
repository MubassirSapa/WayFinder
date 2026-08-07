"use client";

import {
  ArrowUpDown,
  ArrowUpRight,
  TrendingUp,
  Waypoints,
  type LucideIcon,
} from "lucide-react";

import type { RouteFloorSegment } from "@/features/navigation/types/navigation.types";

import type { ViewerFloor, ViewerPathEdge } from "../types/map-viewer.types";
import { FloorWheel } from "./FloorWheel";

interface RouteFloorSelectProps {
  activeSegmentIndex: number;
  floors: ViewerFloor[];
  onJumpToSegment: (index: number) => void;
  segments: RouteFloorSegment[];
}

const CONNECTOR_ICONS: Record<ViewerPathEdge["type"], LucideIcon> = {
  elevator: ArrowUpDown,
  escalator: TrendingUp,
  ramp: Waypoints,
  stairs: ArrowUpRight,
  walkway: Waypoints,
};

// Canceling the route entirely already lives as "Clear" in the Navigate
// panel's "Get directions" header (RoutePanel) - this control is only
// responsible for moving between the route's floor stops. The wheel shows
// each floor's plain level number, not its name - matching a real elevator
// panel / duration-wheel, not a labeled list.
export function RouteFloorSelect({
  activeSegmentIndex,
  floors,
  onJumpToSegment,
  segments,
}: RouteFloorSelectProps) {
  const items = segments.map((segment, index) => {
    const level = floors.find((floor) => floor.id === segment.floorId)?.level;

    return {
      connectorIcon: segment.enterViaEdgeType ? CONNECTOR_ICONS[segment.enterViaEdgeType] : null,
      key: `${segment.floorId}-${index}`,
      label: level === undefined ? "?" : String(level),
    };
  });

  if (items.length === 0) {
    return null;
  }

  return (
    <FloorWheel
      activeIndex={activeSegmentIndex}
      ariaLabel="Route floor navigation"
      items={items}
      onChange={onJumpToSegment}
    />
  );
}
