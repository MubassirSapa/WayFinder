import { memo } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { WayfinderBrand } from "@/components/shared/brand/WayfinderBrand";
import { ModeToggle } from "@/components/shared/theme/ModeToggle";

import { formatIdAsTitle } from "../lib/mapViewerViewport";
import type { ViewerFloor } from "../types/map-viewer.types";

interface MapViewerPageHeaderProps {
  activeFloor: ViewerFloor | null;
}

// Memoized because MapViewerShell re-renders on every selection/search/route
// change — none of which this header cares about — so without this it would
// re-render on all of them for no visual reason.
export const MapViewerPageHeader = memo(function MapViewerPageHeader({
  activeFloor,
}: MapViewerPageHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/92 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <WayfinderBrand href="/" className="shrink-0" textClassName="hidden sm:inline" />

        <div className="flex min-w-0 flex-1 items-center justify-center px-2">
          {activeFloor ? (
            <Breadcrumb className="min-w-0">
              <BreadcrumbList className="flex-nowrap">
                <BreadcrumbItem className="min-w-0">
                  <BreadcrumbPage className="truncate text-sm font-semibold text-foreground sm:text-base">
                    {activeFloor.buildingName ?? formatIdAsTitle(activeFloor.buildingId)}
                  </BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem className="min-w-0">
                  <BreadcrumbPage className="truncate text-sm font-medium text-muted-foreground sm:text-base">
                    {activeFloor.name}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          ) : (
            <span className="truncate text-sm font-semibold text-muted-foreground sm:text-base">
              Published maps
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
});
