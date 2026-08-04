import { MapPin, Navigation } from "lucide-react";

import { cn } from "@/lib/utils";

type ViewerFloorPlateProps = {
  className: string;
  label: string;
  isActive?: boolean;
};

type ViewerHeroVisualProps = {
  showOnMobile?: boolean;
};

const roomLayouts = [
  "left-[6%] top-[7%] h-[34%] w-[39%]",
  "right-[6%] top-[7%] h-[34%] w-[40%]",
  "bottom-[7%] left-[6%] h-[38%] w-[27%]",
  "bottom-[7%] left-[37%] h-[38%] w-[27%]",
  "bottom-[7%] right-[6%] h-[38%] w-[26%]",
] as const;

function ViewerRoute() {
  return (
    <>
      <span className="absolute left-[13%] top-[20%] rounded-sm bg-background/85 px-1.5 py-0.5 text-[0.6rem] font-semibold text-foreground">
        Main hall
      </span>
      <span className="absolute right-[13%] top-[20%] rounded-sm bg-background/85 px-1.5 py-0.5 text-[0.6rem] font-semibold text-foreground">
        Food court
      </span>
      <span className="absolute bottom-[19%] left-[43%] rounded-sm bg-background/85 px-1.5 py-0.5 text-[0.6rem] font-semibold text-foreground">
        Reception
      </span>

      <svg
        className="absolute inset-0 size-full overflow-visible text-primary drop-shadow-[0_0_8px_var(--primary)]"
        fill="none"
        viewBox="0 0 100 75"
      >
        <defs>
          <marker
            id="viewer-route-arrow"
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
          d="M20 61H32V39H52V56"
          markerEnd="url(#viewer-route-arrow)"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <span className="absolute bottom-[11%] left-[7%] flex items-center gap-1 rounded-full border border-border bg-background/90 px-2 py-1 text-[0.55rem] font-semibold text-foreground shadow-sm">
        <Navigation className="size-3 text-primary" aria-hidden />
        You are here
      </span>
      <span className="absolute bottom-[25%] left-[51%] flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
        <MapPin className="size-4" aria-hidden />
      </span>
    </>
  );
}

function ViewerFloorPlate({ className, label, isActive = false }: ViewerFloorPlateProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 rounded-md border border-foreground/20 bg-card shadow-lg ring-1 ring-foreground/10 backface-hidden",
        isActive && "border-primary/50 ring-primary/20",
        className,
      )}
    >
      {roomLayouts.map((roomClassName) => (
        <span
          className={cn(
            "absolute rounded-sm border border-border bg-muted/80",
            roomClassName,
            isActive && roomClassName.includes("left-[37%]") && "border-primary bg-primary/10",
          )}
          key={roomClassName}
        />
      ))}

      <span className="absolute bottom-[3%] left-[5%] text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-foreground/80">
        {label}
      </span>

      {isActive ? <ViewerRoute /> : null}
    </div>
  );
}

export function ViewerHeroVisual({ showOnMobile = false }: ViewerHeroVisualProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative mx-auto h-56 w-full max-w-lg overflow-visible lg:h-60",
        showOnMobile ? "block" : "hidden sm:block",
      )}
    >
      <div className="perspective-distant absolute inset-0">
        <div
          className={cn(
            "absolute left-1/2 top-1/2 aspect-4/3 -translate-x-1/2 -translate-y-1/2 transform-3d lg:w-[64%]",
            showOnMobile ? "w-[72%] sm:w-[54%]" : "w-[54%]",
          )}
        >
          <div className="relative size-full transform-3d transform-[rotateX(52deg)_rotateZ(-36deg)]">
            <ViewerFloorPlate className="transform-[translateZ(0)]" label="Ground - Entrance" />
            <ViewerFloorPlate
              className="transform-[translateZ(3rem)]"
              isActive
              label="Level 1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
