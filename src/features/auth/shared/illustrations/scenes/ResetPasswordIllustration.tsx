import { KeyRound } from "lucide-react";

import IsometricPlate, { PlateRooms } from "../IsometricPlate";
import IsometricScene, { IsometricTiltGroup } from "../IsometricScene";

/** A route continuing on, solid, from an unlocked point — the "after" to forgot-password's "before." */
const ResetPasswordIllustration = () => {
  return (
    <IsometricScene>
      <IsometricTiltGroup>
        <IsometricPlate className="inset-0" label="Ground - Entrance">
          <PlateRooms />

          <svg
            className="absolute inset-0 size-full overflow-visible text-primary drop-shadow-[0_0_8px_var(--primary)]"
            fill="none"
            viewBox="0 0 100 75"
          >
            <defs>
              <marker
                id="reset-password-route-arrow"
                markerHeight="7"
                markerWidth="7"
                orient="auto"
                refX="6"
                refY="3.5"
              >
                <path d="M0 0L7 3.5L0 7Z" fill="currentColor" />
              </marker>
            </defs>
            <path
              d="M34 50V61H50"
              markerEnd="url(#reset-password-route-arrow)"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <span className="absolute bottom-[11%] left-[7%] flex items-center gap-1 rounded-full border border-border bg-background/90 px-2 py-1 text-[0.55rem] font-semibold text-foreground shadow-sm">
            <KeyRound aria-hidden className="size-3 text-primary" />
            Unlocked
          </span>
          <span className="absolute left-[33%] top-[36%] flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
            <KeyRound aria-hidden className="size-4" />
          </span>
        </IsometricPlate>
      </IsometricTiltGroup>
    </IsometricScene>
  );
};

export default ResetPasswordIllustration;
