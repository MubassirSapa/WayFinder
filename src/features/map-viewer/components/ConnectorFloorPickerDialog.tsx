"use client";

import { ArrowUpDown, ArrowUpRight, TrendingUp, type LucideIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { ConnectorTargetInfo } from "../types/map-viewer.types";

const CONNECTOR_ICONS: Record<"stairs" | "elevator" | "escalator", LucideIcon> = {
  elevator: ArrowUpDown,
  escalator: TrendingUp,
  stairs: ArrowUpRight,
};

interface ConnectorFloorPickerDialogProps {
  connectorType: "stairs" | "elevator" | "escalator";
  onOpenChange: (open: boolean) => void;
  onSelectFloor: (floorId: string) => void;
  open: boolean;
  targets: ConnectorTargetInfo[];
}

// Shown instead of guessing which floor to jump to when a connector (usually
// an elevator) serves more than two floors — double-clicking it with no
// single obvious target would otherwise silently jump to whichever edge
// happened to be found first.
export function ConnectorFloorPickerDialog({
  connectorType,
  onOpenChange,
  onSelectFloor,
  open,
  targets,
}: ConnectorFloorPickerDialogProps) {
  const Icon = CONNECTOR_ICONS[connectorType];

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose a floor</DialogTitle>
        </DialogHeader>
        <div className="space-y-1.5">
          {targets.map((target) => (
            <button
              className="flex w-full items-center gap-2.5 rounded-lg border border-border px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-muted/60"
              key={target.floorId}
              onClick={() => {
                onSelectFloor(target.floorId);
                onOpenChange(false);
              }}
              type="button"
            >
              <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
              {target.floorName}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
