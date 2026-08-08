import type { ReactNode } from "react";

interface MapCornerControlsProps {
  floorControls: ReactNode;
  zoomControls: ReactNode;
}

export function MapCornerControls({ floorControls, zoomControls }: MapCornerControlsProps) {
  return (
    <div
      // bottom-20 used to clear the collapsed mobile sidebar sheet's handle
      // docked at the bottom of the screen - that sheet is commented out
      // (MapViewerShell no longer renders MapViewerSidebar), so there's
      // nothing left to clear on mobile either; bottom-4 everywhere now.
      className="pointer-events-none absolute inset-x-3 bottom-4 grid grid-cols-[auto_minmax(0,1fr)] items-end gap-2 md:inset-x-4"
      data-testid="map-corner-controls"
    >
      <div className="flex justify-start">{zoomControls}</div>
      <div className="flex min-w-0 justify-end">{floorControls}</div>
    </div>
  );
}
