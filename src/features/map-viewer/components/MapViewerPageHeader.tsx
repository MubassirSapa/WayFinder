import { memo } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WayfinderBrand } from "@/components/shared/brand/WayfinderBrand";
import { ModeToggle } from "@/components/shared/theme/ModeToggle";

import { formatOrganizationName } from "../lib/mapViewerViewport";
import type { ViewerFloor } from "../types/map-viewer.types";

interface MapViewerPageHeaderProps {
  activeFloor: ViewerFloor | null;
  floors: ViewerFloor[];
  onFloorChange: (floorId: string) => void;
}

// Memoized because MapViewerShell re-renders on every selection/search/route
// change — none of which this header cares about — so without this it would
// re-render on all of them for no visual reason.
export const MapViewerPageHeader = memo(function MapViewerPageHeader({
  activeFloor,
  floors,
  onFloorChange,
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
                    {activeFloor.organizationName ?? formatOrganizationName(activeFloor.buildingId)}
                  </BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <Select
                    items={floors.map((floor) => ({ label: floor.name, value: floor.id }))}
                    onValueChange={(value) => {
                      if (value) {
                        onFloorChange(String(value));
                      }
                    }}
                    value={activeFloor.id}
                  >
                    <SelectTrigger
                      aria-label="Switch floor"
                      className="h-8 gap-1 border-none bg-transparent px-1.5 text-sm font-semibold text-foreground shadow-none hover:bg-muted/60 sm:h-7 sm:text-base"
                      size="sm"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {floors.map((floor) => (
                        <SelectItem key={floor.id} value={floor.id}>
                          {floor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
