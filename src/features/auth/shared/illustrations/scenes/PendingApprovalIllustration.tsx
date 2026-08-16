import { Clock } from "lucide-react";

import IsometricPlate, { PlateRooms } from "../IsometricPlate";
import IsometricScene, { IsometricTiltGroup } from "../IsometricScene";

/** The plate sits dimmed and still - nothing routes across it yet, waiting on a decision from outside the frame. */
const PendingApprovalIllustration = () => {
  return (
    <IsometricScene>
      <IsometricTiltGroup>
        <IsometricPlate className="inset-0" dimmed label="Ground - Entrance">
          <PlateRooms revealCount={3} />

          <span className="absolute bottom-[11%] left-[7%] flex items-center gap-1 rounded-full border border-border bg-background/90 px-2 py-1 text-[0.55rem] font-semibold text-foreground shadow-sm">
            <Clock aria-hidden className="size-3 text-primary" />
            Under review
          </span>
        </IsometricPlate>
      </IsometricTiltGroup>

      <span className="absolute right-[10%] top-[26%] flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
        <Clock aria-hidden className="size-5" />
      </span>
    </IsometricScene>
  );
};

export default PendingApprovalIllustration;
