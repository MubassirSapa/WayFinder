import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface MapCornerControlsProps {
  expandedSheetHeight: number;
  floorControls: ReactNode;
  isMobileSidebarExpanded: boolean;
  zoomControls: ReactNode;
}

const EXPANDED_GAP_PX = 12;

export function MapCornerControls({
  expandedSheetHeight,
  floorControls,
  isMobileSidebarExpanded,
  zoomControls,
}: MapCornerControlsProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-3 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 transition-[bottom] duration-300 ease-out md:inset-x-4 md:bottom-4",
        // The mobile sheet (MapViewerSidebar) is fixed to the bottom of the
        // screen. Left at the collapsed-state offset while expanded, it
        // would physically cover these controls, so this lifts them to sit
        // just above the sheet's real, measured top edge instead of a
        // guessed one - see MapViewerSidebar's onExpandedHeightChange.
        isMobileSidebarExpanded ? "bottom-(--corner-controls-lift)" : "bottom-20",
      )}
      data-testid="map-corner-controls"
      style={
        isMobileSidebarExpanded
          ? ({ "--corner-controls-lift": `${expandedSheetHeight + EXPANDED_GAP_PX}px` } as CSSProperties)
          : undefined
      }
    >
      <div className="flex min-w-0 justify-start">{floorControls}</div>
      <div className="flex justify-end">{zoomControls}</div>
    </div>
  );
}
