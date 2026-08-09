import { UsersRound } from "lucide-react";

import IsometricPlate, { PlateRooms } from "../IsometricPlate";
import IsometricScene, { IsometricTiltGroup } from "../IsometricScene";

/** Two separate routes from opposite edges converge into one shared node — genuinely different geometry: "joining," not "arriving." */
const InviteAcceptIllustration = () => {
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
            <circle cx="14" cy="40" fill="currentColor" r="2" stroke="var(--card)" strokeWidth="0.8" />
            <circle cx="86" cy="40" fill="currentColor" r="2" stroke="var(--card)" strokeWidth="0.8" />
            <path
              className="animate-[wf-route-flow_1.4s_linear_infinite]"
              d="M16 40H44"
              stroke="currentColor"
              strokeDasharray="8 5"
              strokeLinecap="round"
              strokeWidth="2.2"
              vectorEffect="non-scaling-stroke"
            />
            <path
              className="animate-[wf-route-flow_1.4s_linear_infinite]"
              d="M84 40H50"
              stroke="currentColor"
              strokeDasharray="8 5"
              strokeLinecap="round"
              strokeWidth="2.2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <span className="absolute left-[44%] top-[43%] flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
            <UsersRound aria-hidden className="size-4" />
          </span>
          <span className="absolute bottom-[11%] left-[7%] flex items-center gap-1 rounded-full border border-border bg-background/90 px-2 py-1 text-[0.55rem] font-semibold text-foreground shadow-sm">
            <UsersRound aria-hidden className="size-3 text-primary" />
            Welcome
          </span>
        </IsometricPlate>
      </IsometricTiltGroup>
    </IsometricScene>
  );
};

export default InviteAcceptIllustration;
