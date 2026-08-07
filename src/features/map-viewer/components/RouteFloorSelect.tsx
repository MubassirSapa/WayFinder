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
  // Displayed level-descending (a higher floor above a lower one, mimicking
  // a real building) instead of raw route-traversal order, which runs
  // whichever direction the destination happens to be - a route walking
  // down would otherwise show its floors bottom-to-top. `originalIndex`
  // keeps onChange/activeIndex mapped back to the real segment position,
  // same as RoutePanel's own step list does for the same reason.
  const orderedSegments = segments
    .map((segment, originalIndex) => ({
      level: floors.find((floor) => floor.id === segment.floorId)?.level,
      originalIndex,
      segment,
    }))
    .sort((a, b) => (b.level ?? -Infinity) - (a.level ?? -Infinity));

  const items = orderedSegments.map(({ level, originalIndex, segment }) => ({
    connectorIcon: segment.enterViaEdgeType ? CONNECTOR_ICONS[segment.enterViaEdgeType] : null,
    key: `${segment.floorId}-${originalIndex}`,
    label: level === undefined ? "?" : String(level),
  }));

  const activeIndex = orderedSegments.findIndex((entry) => entry.originalIndex === activeSegmentIndex);

  if (items.length === 0) {
    return null;
  }

  return (
    <FloorWheel
      activeIndex={activeIndex}
      ariaLabel="Route floor navigation"
      items={items}
      onChange={(displayIndex) => {
        const target = orderedSegments[displayIndex];
        if (target) {
          onJumpToSegment(target.originalIndex);
        }
      }}
    />
  );
}
