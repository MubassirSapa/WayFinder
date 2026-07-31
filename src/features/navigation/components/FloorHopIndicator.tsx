"use client";

import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface FloorHopIndicatorProps {
  edgeType?: "stairs" | "elevator" | "escalator" | "walkway" | "ramp";
  floorName: string;
  onAdvance: () => void;
}

export function FloorHopIndicator({ edgeType, floorName, onAdvance }: FloorHopIndicatorProps) {
  const via = edgeType === "elevator" || edgeType === "escalator" ? edgeType : "stairs";

  return (
    // Bottom offset clears the collapsed mobile sidebar sheet (which docks
    // fixed at the bottom of the screen and would otherwise sit on top of
    // this) — back to a plain bottom-4 at md+, where the sidebar is a normal
    // grid column instead.
    <div className="pointer-events-none absolute inset-x-0 bottom-20 z-10 flex justify-center px-4 md:bottom-4">
      <Button
        className="pointer-events-auto shadow-lg"
        onClick={onAdvance}
        size="sm"
      >
        <ArrowUpRight className="h-3.5 w-3.5" />
        {`Continue via ${via} to ${floorName}`}
      </Button>
    </div>
  );
}
