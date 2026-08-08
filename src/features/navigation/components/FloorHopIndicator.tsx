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
    // bottom-36 used to clear the collapsed mobile sidebar sheet's handle -
    // that sheet is commented out (MapViewerShell no longer renders
    // MapViewerSidebar), so there's nothing left to clear on mobile. Went
    // straight to bottom-20 (matching md+) first, but on a narrow phone that
    // put it close enough to graze the corner floor wheel, which reaches
    // higher than the zoom control beside it - bottom-28 keeps it pulled
    // down from the old value while staying clear of the wheel.
    <div className="pointer-events-none absolute inset-x-0 bottom-28 z-10 flex justify-center px-4 md:bottom-20">
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
