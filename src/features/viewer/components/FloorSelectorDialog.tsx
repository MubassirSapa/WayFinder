"use client";

import Link from "next/link";
import { ArrowRight, Layers3 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatFloorLevel } from "@/features/viewer/lib/format";
import type { LandingVenue } from "@/features/viewer/types";

type FloorSelectorDialogProps = {
  venue: LandingVenue | null;
  onClose: () => void;
};

export function FloorSelectorDialog({ venue, onClose }: FloorSelectorDialogProps) {
  return (
    <Dialog open={venue !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-0 overflow-hidden p-0 sm:max-w-md">
        {venue ? (
          <>
            <DialogHeader className="border-b border-border px-5 py-4 pe-12">
              <DialogTitle className="text-base font-semibold">Choose a floor</DialogTitle>
              <DialogDescription className="line-clamp-2 text-sm">{venue.name}</DialogDescription>
            </DialogHeader>

            <div className="max-h-[min(60dvh,28rem)] overflow-y-auto overscroll-contain">
              <div className="space-y-2 p-3">
                {venue.floors.map((floor) => (
                  <Link
                    aria-label={`Open ${floor.name} map`}
                    className="group flex min-h-16 items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2.5 transition sm:hover:border-primary/40 sm:hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    href={floor.href}
                    key={floor.id}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Layers3 className="size-5" aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-card-foreground">
                          {floor.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {formatFloorLevel(floor.level)}
                        </span>
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-primary">
                      Open map
                      <ArrowRight
                        className="size-4 transition-transform sm:group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
