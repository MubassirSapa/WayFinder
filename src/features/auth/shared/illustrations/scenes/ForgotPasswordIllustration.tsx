import { Search } from "lucide-react";

import IsometricPlate, { PlateRooms } from "../IsometricPlate";
import IsometricScene, { IsometricTiltGroup } from "../IsometricScene";

/** A faded, dashed route that dead-ends mid-air over a dimmed plate — visually "lost," not just relabeled. */
const ForgotPasswordIllustration = () => {
  return (
    <IsometricScene>
      <IsometricTiltGroup>
        <IsometricPlate className="inset-0" dimmed label="Ground - Entrance">
          <PlateRooms />

          <svg className="absolute inset-0 size-full overflow-visible text-primary/50" fill="none" viewBox="0 0 100 75">
            <circle cx="18" cy="61" fill="currentColor" r="2.1" stroke="var(--card)" strokeWidth="0.8" />
            <path
              d="M20 61H32V50"
              stroke="currentColor"
              strokeDasharray="3 3"
              strokeLinecap="round"
              strokeWidth="2.2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <span className="absolute bottom-[11%] left-[7%] flex items-center gap-1 rounded-full border border-border bg-background/90 px-2 py-1 text-[0.55rem] font-semibold text-foreground shadow-sm">
            <Search aria-hidden className="size-3 text-primary" />
            Searching
          </span>
          <span className="absolute left-[33%] top-[36%] flex size-8 animate-[wf-drift_5s_ease-in-out_infinite] items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
            <Search aria-hidden className="size-4" />
          </span>
        </IsometricPlate>
      </IsometricTiltGroup>
    </IsometricScene>
  );
};

export default ForgotPasswordIllustration;
