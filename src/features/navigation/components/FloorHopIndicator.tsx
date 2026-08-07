"use client";

import { ArrowDown, ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ConnectorDirection } from "@/features/map-viewer/types/map-viewer.types";

interface FloorHopIndicatorProps {
  direction: ConnectorDirection;
  edgeType?: "stairs" | "elevator" | "escalator" | "walkway" | "ramp";
  floorName: string;
  onAdvance: () => void;
}

export function FloorHopIndicator({ direction, edgeType, floorName, onAdvance }: FloorHopIndicatorProps) {
  const via = edgeType === "elevator" || edgeType === "escalator" ? edgeType : "stairs";
  const DirectionIcon = direction === "up" ? ArrowUp : ArrowDown;

  return (
    // Bottom offset clears the collapsed mobile sidebar sheet (which docks
    // fixed at the bottom of the screen and would otherwise sit on top of
    // this) — back to a plain bottom-4 at md+, where the sidebar is a normal
    // grid column instead.
    <div className="pointer-events-none absolute inset-x-0 bottom-36 z-10 flex justify-center px-4 md:bottom-20">
      <Button
        className="pointer-events-auto shadow-lg p-4"
        onClick={onAdvance}
        size="lg"
      >
        <DirectionIcon className="h-3.5 w-3.5" />
        {`Continue via ${via} to ${floorName}`}
      </Button>
    </div>
  );
}
