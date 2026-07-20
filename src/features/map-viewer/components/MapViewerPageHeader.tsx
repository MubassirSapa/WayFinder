import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { WayfinderBrand } from "@/components/shared/brand/WayfinderBrand";
import { ModeToggle } from "@/components/shared/theme/ModeToggle";

import {
  formatFloorLabel,
  formatOrganizationName,
} from "../lib/mapViewerViewport";
import type { ViewerFloor } from "../types/map-viewer.types";

interface MapViewerPageHeaderProps {
  activeFloor: ViewerFloor | null;
}

export function MapViewerPageHeader({
  activeFloor,
}: MapViewerPageHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/92 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <WayfinderBrand href="/" className="shrink-0" textClassName="hidden sm:inline" />
          <Separator className="hidden h-6 sm:block" orientation="vertical" />
          <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
            {activeFloor
              ? activeFloor.organizationName ?? formatOrganizationName(activeFloor.buildingId)
              : "Published maps"}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {activeFloor ? (
            <Badge variant="outline" className="border-border bg-card/70 text-muted-foreground">
              {formatFloorLabel(activeFloor)}
            </Badge>
          ) : null}
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
