"use client";

import {
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  MapPinned,
  TrendingUp,
  Waypoints,
  X,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
  onClearRoute: () => void;
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
  onClearRoute,
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
  const previousOption = options[activeSegmentIndex - 1];
  const nextOption = options[activeSegmentIndex + 1];
  const activeFloor = floors.find((floor) => floor.id === activeOption?.segment.floorId);
  const previousFloor = floors.find((floor) => floor.id === previousOption?.segment.floorId);
  const nextFloor = floors.find((floor) => floor.id === nextOption?.segment.floorId);
  const PreviousDirectionIcon = activeFloor && previousFloor
    ? previousFloor.level > activeFloor.level ? ArrowUp : ArrowDown
    : ArrowDown;
  const NextDirectionIcon = activeFloor && nextFloor
    ? nextFloor.level > activeFloor.level ? ArrowUp : ArrowDown
    : ArrowUp;

  if (!activeOption) {
    return null;
  }

  return (
    <div aria-label="Route floor navigation" className="relative flex min-w-0 items-center gap-0.5 rounded-full border border-border bg-card/95 p-1 shadow-lg backdrop-blur-xl" role="group">
      <Button
        aria-label={previousOption ? `Go ${previousFloor && activeFloor && previousFloor.level > activeFloor.level ? "up" : "down"} to ${previousOption.floorName}` : "No previous route floor"}
        className="size-9 shrink-0 rounded-full sm:size-10"
        disabled={!previousOption}
        onClick={() => previousOption && onJumpToSegment(previousOption.index)}
        size="icon"
        type="button"
        variant="ghost"
      >
        <PreviousDirectionIcon />
      </Button>
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
        className="h-9 min-w-0 flex-1 rounded-full border-0 bg-transparent px-2 py-0 text-foreground shadow-none hover:bg-muted/60 sm:h-10"
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
                  {index > 0 ? (() => {
                    const previousFloor = floors.find((floor) => floor.id === options[index - 1]?.segment.floorId);
                    const currentFloor = floors.find((floor) => floor.id === segment.floorId);
                    const DirectionIcon = previousFloor && currentFloor && currentFloor.level > previousFloor.level ? ArrowUp : ArrowDown;
                    return <DirectionIcon aria-label={previousFloor && currentFloor && currentFloor.level > previousFloor.level ? "Up" : "Down"} className="ml-0.5 size-3 text-primary" />;
                  })() : null}
                </span>
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
      </Select>
      <Button
        aria-label={nextOption ? `Go ${nextFloor && activeFloor && nextFloor.level > activeFloor.level ? "up" : "down"} to ${nextOption.floorName}` : "No next route floor"}
        className="size-9 shrink-0 rounded-full sm:size-10"
        disabled={!nextOption}
        onClick={() => nextOption && onJumpToSegment(nextOption.index)}
        size="icon"
        type="button"
        variant="ghost"
      >
        <NextDirectionIcon />
      </Button>
      <button
        aria-label="Cancel navigation"
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={onClearRoute}
        type="button"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
