"use client";

import {
  ArrowUpDown,
  ArrowUpRight,
  MapPinned,
  TrendingUp,
  Waypoints,
  type LucideIcon,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RouteFloorSegment } from "@/features/navigation/types/navigation.types";

import type { ViewerFloor, ViewerPathEdge } from "../types/map-viewer.types";

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

export function RouteFloorSelect({
  activeSegmentIndex,
  floors,
  onJumpToSegment,
  segments,
}: RouteFloorSelectProps) {
  const options = segments.map((segment, index) => ({
    floorName: floors.find((floor) => floor.id === segment.floorId)?.name ?? "Floor",
    index,
    segment,
    value: String(index),
  }));
  const activeOption = options[activeSegmentIndex] ?? options[0];

  if (!activeOption) {
    return null;
  }

  return (
    <Select
      items={options.map((option) => ({ label: option.floorName, value: option.value }))}
      onValueChange={(value) => {
        if (value !== null) {
          onJumpToSegment(Number(value));
        }
      }}
      value={activeOption.value}
    >
      <SelectTrigger
        aria-label={`Route floors, ${activeOption.floorName}, stop ${activeSegmentIndex + 1} of ${segments.length}`}
        className="h-9 w-full max-w-64 rounded-full border-border bg-card/95 px-3 text-foreground shadow-lg backdrop-blur-xl hover:bg-card sm:h-10 sm:max-w-72 sm:px-4"
      >
        <MapPinned className="text-primary" />
        <SelectValue className="min-w-0">
          <span className="truncate font-semibold">{activeOption.floorName}</span>
          <span className="shrink-0 text-[10px] font-medium text-muted-foreground sm:text-xs">
            {activeSegmentIndex + 1}/{segments.length}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        align="start"
        alignItemWithTrigger={false}
        className="max-h-72 w-[min(20rem,calc(100vw-2rem))]"
        side="bottom"
        sideOffset={8}
      >
        {options.map(({ floorName, index, segment, value }) => {
          const ConnectorIcon = segment.enterViaEdgeType
            ? CONNECTOR_ICONS[segment.enterViaEdgeType]
            : null;

          return (
            <SelectItem className="min-h-10 px-2.5 py-2" key={`${segment.floorId}-${index}`} value={value}>
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-foreground">{floorName}</span>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  {ConnectorIcon ? <ConnectorIcon /> : <MapPinned />}
                  {segment.enterViaEdgeType ? `via ${segment.enterViaEdgeType}` : "Route starts here"}
                </span>
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
