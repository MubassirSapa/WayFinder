import type { ReactNode } from "react";

interface MapCornerControlsProps {
  floorControls: ReactNode;
  zoomControls: ReactNode;
}

export function MapCornerControls({ floorControls, zoomControls }: MapCornerControlsProps) {
  return (
    <div
      className="pointer-events-none absolute inset-x-3 bottom-20 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 md:inset-x-4 md:bottom-4"
      data-testid="map-corner-controls"
    >
      <div className="flex min-w-0 justify-start">{floorControls}</div>
      <div className="flex justify-end">{zoomControls}</div>
    </div>
  );
}
