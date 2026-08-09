import { Mail } from "lucide-react";

import IsometricPlate, { PlateRooms } from "../IsometricPlate";
import IsometricScene, { IsometricTiltGroup } from "../IsometricScene";

/** A route flies off the plate entirely toward an envelope sitting outside the tilted frame — "sent elsewhere," not "arrived here." */
const CheckEmailIllustration = () => {
  return (
    <IsometricScene>
      <IsometricTiltGroup>
        <IsometricPlate className="inset-0" label="Ground - Entrance">
          <PlateRooms />

          <svg className="absolute inset-0 size-full overflow-visible text-primary drop-shadow-[0_0_8px_var(--primary)]" fill="none" viewBox="0 0 100 75">
            <circle cx="35" cy="55" fill="currentColor" r="2.1" stroke="var(--card)" strokeWidth="0.8" />
            <path
              className="animate-[wf-route-flow_1.4s_linear_infinite]"
              d="M37 55H62"
              stroke="currentColor"
              strokeDasharray="8 5"
              strokeLinecap="round"
              strokeWidth="2.2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <span className="absolute bottom-[11%] left-[7%] flex items-center gap-1 rounded-full border border-border bg-background/90 px-2 py-1 text-[0.55rem] font-semibold text-foreground shadow-sm">
            <Mail aria-hidden className="size-3 text-primary" />
            Message sent
          </span>
        </IsometricPlate>
      </IsometricTiltGroup>

      <span className="absolute right-[10%] top-[26%] flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
        <Mail aria-hidden className="size-5" />
      </span>
    </IsometricScene>
  );
};

export default CheckEmailIllustration;
