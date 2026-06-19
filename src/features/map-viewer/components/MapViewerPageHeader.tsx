import { Badge } from "@/components/ui/badge";

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
    <header className="border-b border-border bg-background/92 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {activeFloor ? formatOrganizationName(activeFloor.buildingId) : "Published maps"}
        </h1>

        <div className="hidden items-center gap-2 md:flex">
          {activeFloor ? (
            <Badge variant="outline" className="border-border bg-card/70 text-muted-foreground">
              {formatFloorLabel(activeFloor)}
            </Badge>
          ) : null}
        </div>
      </div>
    </header>
  );
}
