"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface RouteStatusIndicatorProps {
  accessibleOnly: boolean;
  distanceMeters?: number;
  found: boolean;
}

// Confirms whether a route was actually found the moment a destination is
// set, on the map itself — not just as text tucked inside "Get directions",
// which on mobile can be scrolled/collapsed out of view right when this
// matters most. Shares FloorHopIndicator's bottom-center slot (mutually
// exclusive: a floor hop still pending takes priority over this).
export function RouteStatusIndicator({ accessibleOnly, distanceMeters, found }: RouteStatusIndicatorProps) {
  return (
    // Bottom offset clears the collapsed mobile sidebar sheet, same reason
    // as FloorHopIndicator — back to bottom-4 at md+.
    <div className="pointer-events-none absolute inset-x-0 bottom-36 z-10 flex justify-center px-4 md:bottom-20">
      <div
        className={[
          "pointer-events-auto flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-lg",
          found
            ? "border border-success/20 bg-success/10 text-success backdrop-blur-xl"
            : "border border-destructive/20 bg-destructive/10 text-destructive backdrop-blur-xl",
        ].join(" ")}
      >
        {found ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5" />
            {`Your destination floor${typeof distanceMeters === "number" ? ` • ${distanceMeters.toFixed(1)} m` : ""}`}
          </>
        ) : (
          <>
            <AlertTriangle className="h-3.5 w-3.5" />
            {accessibleOnly ? "No accessible route found" : "No route found"}
          </>
        )}
      </div>
    </div>
  );
}
