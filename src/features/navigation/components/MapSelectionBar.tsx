"use client";

import { MapPin, X } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useNavigationStore } from "../store/useNavigationStore";

interface MapSelectionBarProps {
  label: string;
  nodeId: string | null;
  onClose: () => void;
}

// Lets a user set the origin/destination straight from clicking an object on
// the map, instead of having to go find the same actions in the sidebar's
// Selection card (which may be scrolled out of view, especially on mobile).
export function MapSelectionBar({ label, nodeId, onClose }: MapSelectionBarProps) {
  const originNodeId = useNavigationStore((state) => state.originNodeId);
  const setOrigin = useNavigationStore((state) => state.setOrigin);
  const setDestination = useNavigationStore((state) => state.setDestination);

  const isOrigin = nodeId !== null && originNodeId === nodeId;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-16 z-10 flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-full items-center gap-2 rounded-2xl border border-border bg-card/95 px-3 py-2 shadow-lg backdrop-blur-xl">
        <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="max-w-40 truncate text-sm font-medium sm:max-w-60">{label}</span>

        {nodeId ? (
          <>
            <Button
              onClick={() => setOrigin(isOrigin ? null : nodeId)}
              size="sm"
              variant={isOrigin ? "default" : "outline"}
            >
              {isOrigin ? "Starting here" : "Start here"}
            </Button>
            <Button onClick={() => setDestination(nodeId)} size="sm" variant="outline">
              Route here
            </Button>
          </>
        ) : (
          <span className="text-xs text-muted-foreground">Not available for routing yet</span>
        )}

        <button
          aria-label="Dismiss selection"
          className="ml-1 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={onClose}
          type="button"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
