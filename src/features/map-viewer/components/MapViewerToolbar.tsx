import { memo } from "react";

import { Button } from "@/components/ui/button";
import { Grid2x2, Minus, Move, Plus } from "lucide-react";

import { formatFloorLabel } from "../lib/mapViewerViewport";
import type { RouteFloorSegment } from "@/features/navigation/types/navigation.types";
import type { ViewerFloor } from "../types/map-viewer.types";
import { RouteFloorSelect } from "./RouteFloorSelect";

interface MapViewerToolbarProps {
  activeFloor: ViewerFloor | null;
  activeSegmentIndex: number;
  floors: ViewerFloor[];
  segments: RouteFloorSegment[];
  showGrid: boolean;
  onJumpToSegment: (index: number) => void;
  onResetView: () => void;
  onToggleGrid: () => void;
  onZoomChange: (direction: "in" | "out") => void;
}

// Memoized for the same reason as MapViewerPageHeader — MapViewerShell
// re-renders on selection/search/route changes this toolbar doesn't use.
export const MapViewerToolbar = memo(function MapViewerToolbar({
  activeFloor,
  activeSegmentIndex,
  floors,
  segments,
  showGrid,
  onJumpToSegment,
  onResetView,
  onToggleGrid,
  onZoomChange,
}: MapViewerToolbarProps) {
  return (
    <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-card/85 px-3 py-2.5 backdrop-blur-xl sm:px-4 sm:py-3">
      {segments.length > 1 ? (
        <div className="min-w-0 flex-1">
          <RouteFloorSelect
            activeSegmentIndex={activeSegmentIndex}
            floors={floors}
            onJumpToSegment={onJumpToSegment}
            segments={segments}
          />
        </div>
      ) : (
        <p className="min-w-0 flex-1 truncate text-sm font-medium">
          {activeFloor
            ? `${activeFloor.name} • ${formatFloorLabel(activeFloor)}`
            : "No published floor"}
        </p>
      )}

      <div className="flex items-center gap-1.5 sm:gap-2">
        <Button
          className="h-9 rounded-xl px-2.5 text-xs sm:h-auto sm:rounded-md sm:px-3 sm:text-sm"
          onClick={onToggleGrid}
          size="sm"
          type="button"
          variant={showGrid ? "secondary" : "outline"}
        >
          <Grid2x2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Grid</span>
        </Button>
        <Button
          className="h-9 w-9 rounded-xl sm:h-8 sm:w-8 sm:rounded-md"
          onClick={() => onZoomChange("out")}
          size="icon"
          type="button"
          variant="outline"
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <Button
          className="h-9 rounded-xl px-2.5 text-xs sm:h-auto sm:rounded-md sm:px-3 sm:text-sm"
          onClick={onResetView}
          size="sm"
          type="button"
          variant="outline"
        >
          <Move className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </Button>
        <Button
          className="h-9 w-9 rounded-xl sm:h-8 sm:w-8 sm:rounded-md"
          onClick={() => onZoomChange("in")}
          size="icon"
          type="button"
          variant="outline"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
});
