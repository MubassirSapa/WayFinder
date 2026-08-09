import { MapPin, Navigation, type LucideIcon } from "lucide-react";

import IsometricScene, { IsometricTiltGroup } from "./IsometricScene";
import IsometricPlate, { PlateRooms } from "./IsometricPlate";

/**
 * A route arriving at a lit destination on a single tilted floor plate —
 * used by pages whose concept is "you've arrived somewhere" (signin,
 * forgot/reset password, verify email). Other pages compose the same
 * IsometricScene/Plate primitives into a genuinely different scene instead
 * of reusing this one with swapped labels.
 */
const AuthHeroVisual = ({
  badgeIcon: BadgeIcon = Navigation,
  badgeLabel,
  destinationLabel,
  floorLabel,
  markerIcon: MarkerIcon = MapPin,
}: TProps) => {
  return (
    <IsometricScene>
      <IsometricTiltGroup>
        <IsometricPlate className="inset-0" label={floorLabel}>
          <PlateRooms />

          <span className="absolute left-[43%] top-[19%] rounded-sm bg-background/85 px-1.5 py-0.5 text-[0.6rem] font-semibold text-foreground">
            {destinationLabel}
          </span>

          <svg
            className="absolute inset-0 size-full overflow-visible text-primary drop-shadow-[0_0_8px_var(--primary)]"
            fill="none"
            viewBox="0 0 100 75"
          >
            <defs>
              <marker
                id="auth-hero-route-arrow"
                markerHeight="7"
                markerWidth="7"
                orient="auto"
                refX="6"
                refY="3.5"
              >
                <path d="M0 0L7 3.5L0 7Z" fill="currentColor" />
              </marker>
            </defs>
            <circle cx="18" cy="61" fill="currentColor" r="2.1" stroke="var(--card)" strokeWidth="0.8" />
            <path
              className="animate-[wf-route-flow_1.4s_linear_infinite]"
              d="M20 61H32V45H50"
              markerEnd="url(#auth-hero-route-arrow)"
              stroke="currentColor"
              strokeDasharray="8 5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <span className="absolute bottom-[11%] left-[7%] flex items-center gap-1 rounded-full border border-border bg-background/90 px-2 py-1 text-[0.55rem] font-semibold text-foreground shadow-sm">
            <BadgeIcon aria-hidden className="size-3 text-primary" />
            {badgeLabel}
          </span>
          <span className="absolute bottom-[38%] left-[49%] flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
            <MarkerIcon aria-hidden className="size-4" />
          </span>
        </IsometricPlate>
      </IsometricTiltGroup>
    </IsometricScene>
  );
};

export default AuthHeroVisual;

type TProps = {
  /** Icon inside the origin badge pill. Defaults to a navigation arrow. */
  badgeIcon?: LucideIcon;
  /** The small pill near the route origin, e.g. "You are here." */
  badgeLabel: string;
  /** The label near the highlighted destination room. */
  destinationLabel: string;
  /** Caption under the floor plate, e.g. "Ground - Entrance." */
  floorLabel: string;
  /** Icon inside the filled marker circle. Defaults to a map pin. Vary this per page for real visual distinction. */
  markerIcon?: LucideIcon;
};
