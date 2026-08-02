"use client";

import { Grid2x2, Minus, Move, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store";

interface MapZoomControlsProps {
  onResetView: () => void;
  onToggleGrid: () => void;
  onZoomChange: (direction: "in" | "out") => void;
  showGrid: boolean;
}

export function MapZoomControls({
  onResetView,
  onToggleGrid,
  onZoomChange,
  showGrid,
}: MapZoomControlsProps) {
  const zoom = useAppStore((state) => state.viewportZoom);

  return (
    <div
      aria-label="Map view controls"
      className="pointer-events-auto flex items-center gap-1 rounded-full border border-border bg-card/95 p-1 shadow-lg backdrop-blur-xl"
      role="group"
    >
      <Button
        aria-label="Toggle grid"
        className="hidden size-9 rounded-full sm:inline-flex sm:size-10"
        onClick={onToggleGrid}
        size="icon"
        type="button"
        variant={showGrid ? "secondary" : "ghost"}
      >
        <Grid2x2 />
      </Button>
      <Button
        aria-label="Zoom out"
        className="size-9 rounded-full sm:size-10"
        onClick={() => onZoomChange("out")}
        size="icon"
        type="button"
        variant="ghost"
      >
        <Minus />
      </Button>
      <span className="hidden min-w-12 text-center text-xs font-semibold text-muted-foreground sm:block">
        {Math.round(zoom * 100)}%
      </span>
      <Button
        aria-label="Reset map view"
        className="size-9 rounded-full sm:size-10"
        onClick={onResetView}
        size="icon"
        type="button"
        variant="ghost"
      >
        <Move />
      </Button>
      <Button
        aria-label="Zoom in"
        className="size-9 rounded-full sm:size-10"
        onClick={() => onZoomChange("in")}
        size="icon"
        type="button"
        variant="ghost"
      >
        <Plus />
      </Button>
    </div>
  );
}
