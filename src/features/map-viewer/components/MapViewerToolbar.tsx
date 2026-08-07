import { memo } from "react";

import type { RouteFloorSegment } from "@/features/navigation/types/navigation.types";
import type { ViewerFloor } from "../types/map-viewer.types";
import { FloorNavigator } from "./FloorNavigator";
import { MapCornerControls } from "./MapCornerControls";
import { MapZoomControls } from "./MapZoomControls";
import { RouteFloorSelect } from "./RouteFloorSelect";

interface MapViewerToolbarProps {
  activeFloor: ViewerFloor | null;
  activeSegmentIndex: number;
  expandedSheetHeight: number;
  floors: ViewerFloor[];
  isMobileSidebarExpanded: boolean;
  segments: RouteFloorSegment[];
  showGrid: boolean;
  onFloorChange: (floorId: string) => void;
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
  expandedSheetHeight,
  floors,
  isMobileSidebarExpanded,
  segments,
  showGrid,
  onFloorChange,
  onJumpToSegment,
  onResetView,
  onToggleGrid,
  onZoomChange,
}: MapViewerToolbarProps) {
  return (
    // z-40: must stay above the mobile sheet (MapViewerSidebar, z-30) so the
    // floor/zoom controls remain visible instead of ending up behind it once
    // MapCornerControls lifts them to sit above the expanded sheet.
    <div className="pointer-events-none absolute inset-0 z-40">
      <MapCornerControls
        floorControls={segments.length > 1 ? (
          <div className="pointer-events-auto min-w-0 max-w-72">
            <RouteFloorSelect
              activeSegmentIndex={activeSegmentIndex}
              floors={floors}
              onJumpToSegment={onJumpToSegment}
              segments={segments}
            />
          </div>
        ) : activeFloor ? (
          <div className="pointer-events-auto min-w-0">
            <FloorNavigator
              activeFloor={activeFloor}
              floors={floors}
              onFloorChange={onFloorChange}
            />
          </div>
        ) : (
          <p className="pointer-events-auto truncate rounded-full border border-border bg-card/95 px-4 py-2 text-center text-sm font-medium shadow-lg backdrop-blur-xl">
            No published floor
          </p>
        )}
        expandedSheetHeight={expandedSheetHeight}
        isMobileSidebarExpanded={isMobileSidebarExpanded}
        zoomControls={(
        <MapZoomControls
          onResetView={onResetView}
          onToggleGrid={onToggleGrid}
          onZoomChange={onZoomChange}
          showGrid={showGrid}
        />
        )}
      />
    </div>
  );
});
