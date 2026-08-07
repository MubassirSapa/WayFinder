"use client";

import { useAppStore } from "@/store";
import { MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MapSelectionBarProps {
  label: string;
  nodeId: string | null;
  onClose: () => void;
}

// Lets a user set the origin/destination straight from clicking an object on
// the map, instead of having to go find the same actions in the sidebar's
// Selection card (which may be scrolled out of view, especially on mobile).
export function MapSelectionBar({
  label,
  nodeId,
  onClose,
}: MapSelectionBarProps) {
  const originNodeId = useAppStore((state) => state.originNodeId);
  const setOrigin = useAppStore((state) => state.setOrigin);
  const setDestination = useAppStore((state) => state.setDestination);
  const clearRoute = useAppStore((state) => state.clearRoute);

  const isOrigin = nodeId !== null && originNodeId === nodeId;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center px-3 sm:px-4">
      <div className="pointer-events-auto flex max-w-full items-center gap-2 rounded-2xl border border-border bg-card/95 px-3 py-2 shadow-lg backdrop-blur-xl">
        <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="max-w-40 truncate text-sm font-medium sm:max-w-60">
          {label}
        </span>

        {nodeId ? (
          <>
            <Button
              onClick={() => setOrigin(isOrigin ? null : nodeId)}
              size="sm"
              variant={isOrigin ? "default" : "outline"}
            >
              {isOrigin ? "Starting here" : "Start here"}
            </Button>
            <Button
              onClick={() => setDestination(nodeId)}
              size="sm"
              variant="outline"
            >
              Route here
            </Button>
          </>
        ) : (
          <span className="text-xs text-muted-foreground">
            Not available for routing yet
          </span>
        )}

        <Button
          aria-label="Clear route and close"
          className="ml-1 rounded-full text-destructive hover:text-destructive/80"
          onClick={() => {
            clearRoute();
            onClose();
          }}
          size="icon-sm"
          type="button"
          variant="destructive"
        >
          <X className="size-3" />
        </Button>
      </div>
    </div>
  );
}
