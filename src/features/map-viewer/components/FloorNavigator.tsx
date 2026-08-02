"use client";

import { ArrowDown, ArrowUp, Layers3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { formatFloorLabel } from "../lib/mapViewerViewport";
import type { ViewerFloor } from "../types/map-viewer.types";

interface FloorNavigatorProps {
  activeFloor: ViewerFloor;
  floors: ViewerFloor[];
  onFloorChange: (floorId: string) => void;
}

export function FloorNavigator({ activeFloor, floors, onFloorChange }: FloorNavigatorProps) {
  const activeIndex = floors.findIndex((floor) => floor.id === activeFloor.id);
  const floorBelow = activeIndex > 0 ? floors[activeIndex - 1] : null;
  const floorAbove = activeIndex >= 0 && activeIndex < floors.length - 1
    ? floors[activeIndex + 1]
    : null;

  return (
    <div
      aria-label="Floor navigation"
      className="flex w-fit items-center gap-0.5 rounded-full border border-border bg-card/95 p-1 shadow-lg backdrop-blur-xl"
      role="group"
    >
      <Button
        aria-label={floorBelow ? `Go down to ${floorBelow.name}` : "No lower floor"}
        className="size-10 rounded-full"
        disabled={!floorBelow}
        onClick={() => floorBelow && onFloorChange(floorBelow.id)}
        size="icon"
        type="button"
        variant="ghost"
      >
        <ArrowDown />
      </Button>

      <Select
        items={floors.map((floor) => ({ label: floor.name, value: floor.id }))}
        onValueChange={(value) => {
          if (value) {
            onFloorChange(String(value));
          }
        }}
        value={activeFloor.id}
      >
        <SelectTrigger
          aria-label={`Switch floor, ${activeFloor.name}, ${activeIndex + 1} of ${floors.length}`}
          className="h-10 w-16 flex-none border-0 bg-transparent px-2 text-foreground shadow-none hover:bg-muted/60"
        >
          <Layers3 className="text-primary" />
          <SelectValue className="min-w-0">
            <span className="sr-only">{activeFloor.name}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          align="end"
          alignItemWithTrigger={false}
          className="max-h-72 w-[min(20rem,calc(100vw-2rem))]"
          side="bottom"
          sideOffset={8}
        >
          {floors.map((floor, index) => (
            <SelectItem className="min-h-11 px-2.5 py-2" key={floor.id} value={floor.id}>
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-foreground">{floor.name}</span>
                <span className="block text-[10px] text-muted-foreground">{formatFloorLabel(floor)}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        aria-label={floorAbove ? `Go up to ${floorAbove.name}` : "No higher floor"}
        className="size-10 rounded-full"
        disabled={!floorAbove}
        onClick={() => floorAbove && onFloorChange(floorAbove.id)}
        size="icon"
        type="button"
        variant="ghost"
      >
        <ArrowUp />
      </Button>
    </div>
  );
}
