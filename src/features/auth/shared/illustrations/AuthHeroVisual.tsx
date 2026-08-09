import { MapPin, Navigation, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const ROOM_LAYOUTS = [
  "left-[6%] top-[7%] h-[34%] w-[39%]",
  "right-[6%] top-[7%] h-[34%] w-[40%]",
  "bottom-[7%] left-[6%] h-[38%] w-[27%]",
  "bottom-[7%] left-[37%] h-[38%] w-[27%]",
  "bottom-[7%] right-[6%] h-[38%] w-[26%]",
] as const;

/**
 * Auth-page illustration built the same way as the public home hero
 * (ViewerHeroVisual): a 3D-tilted floor plate with a glowing route and a
 * labeled destination, so every illustration in the app — marketing and
 * auth alike — shares one visual language instead of two.
 */
const AuthHeroVisual = ({
  badgeIcon: BadgeIcon = Navigation,
  badgeLabel,
  destinationLabel,
  floorLabel,
  markerIcon: MarkerIcon = MapPin,
}: TProps) => {
  return (
    <div aria-hidden className="relative mx-auto h-64 w-full max-w-sm lg:h-72">
      <div className="perspective-distant absolute inset-0">
        <div className="absolute left-1/2 top-1/2 aspect-4/3 w-[72%] -translate-x-1/2 -translate-y-1/2 transform-3d">
          <div className="relative size-full transform-3d transform-[rotateX(52deg)_rotateZ(-36deg)]">
            <div className="absolute inset-0 rounded-md border border-primary/40 bg-card shadow-lg ring-1 ring-primary/20">
              {ROOM_LAYOUTS.map((roomClassName) => (
                <span
                  className={cn(
                    "absolute rounded-sm border border-border bg-muted/80",
                    roomClassName,
                  )}
                  key={roomClassName}
                />
              ))}

              <span className="absolute bottom-[3%] left-[5%] text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-foreground/80">
                {floorLabel}
              </span>

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
                  d="M20 61H32V45H50"
                  markerEnd="url(#auth-hero-route-arrow)"
                  stroke="currentColor"
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
            </div>
          </div>
        </div>
      </div>
    </div>
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
