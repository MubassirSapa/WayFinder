import { cn } from "@/lib/utils";

type FloorPlateProps = {
  className: string;
  label: string;
  layout: "ground" | "middle" | "top";
};

type PlaceLabel = {
  className: string;
  name: string;
};

const roomLayouts = {
  ground: [
    "left-[6%] top-[8%] h-[34%] w-[30%]",
    "left-[6%] bottom-[8%] h-[42%] w-[30%]",
    "right-[6%] top-[8%] h-[38%] w-[27%]",
    "right-[6%] bottom-[8%] h-[38%] w-[27%]",
  ],
  middle: [
    "left-[6%] top-[8%] h-[38%] w-[23%]",
    "left-[6%] bottom-[8%] h-[38%] w-[23%]",
    "left-[33%] top-[8%] h-[38%] w-[31%]",
    "left-[33%] bottom-[8%] h-[38%] w-[31%]",
    "right-[6%] top-[8%] h-[84%] w-[25%]",
  ],
  top: [
    "left-[6%] top-[8%] h-[35%] w-[58%]",
    "left-[6%] bottom-[8%] h-[42%] w-[27%]",
    "left-[37%] bottom-[8%] h-[42%] w-[27%]",
    "right-[6%] top-[8%] h-[47%] w-[25%]",
    "right-[6%] bottom-[8%] h-[29%] w-[25%]",
  ],
} as const;

const placeLabels: Record<FloorPlateProps["layout"], PlaceLabel[]> = {
  ground: [{ className: "right-[10%] bottom-[22%]", name: "Main entrance" }],
  middle: [{ className: "left-[9%] bottom-[22%]", name: "Clinics" }],
  top: [
    { className: "left-[12%] top-[22%]", name: "Meeting rooms" },
    { className: "right-[10%] top-[27%]", name: "Services" },
    { className: "left-[43%] bottom-[20%]", name: "Reception" },
  ],
};

function RouteOverlay() {
  return (
    <svg
      className="absolute inset-0 size-full overflow-visible text-primary drop-shadow-[0_0_8px_var(--primary)]"
      fill="none"
      viewBox="0 0 100 100"
    >
      <defs>
        <marker
          id="organization-route-arrow"
          markerHeight="8"
          markerWidth="8"
          orient="auto"
          refX="7"
          refY="4"
        >
          <path d="M0 0L8 4L0 8Z" fill="currentColor" />
        </marker>
      </defs>
      <circle cx="82" cy="22" fill="currentColor" r="2.1" stroke="var(--card)" strokeWidth="0.8" />
      <path
        d="M82 24V46H53V64"
        markerEnd="url(#organization-route-arrow)"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function FloorPlate({ className, label, layout }: FloorPlateProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 rounded-md border border-foreground/25 bg-card shadow-lg ring-1 ring-foreground/10 backface-hidden",
        layout === "top" && "border-primary/50 ring-primary/20",
        className,
      )}
    >
      {roomLayouts[layout].map((roomClassName) => (
        <span
          className={cn("absolute rounded-sm border border-border bg-muted/80", roomClassName)}
          key={roomClassName}
        />
      ))}

      {placeLabels[layout].map((place) => (
        <span
          className={cn(
            "absolute rounded-sm bg-background/80 px-1.5 py-0.5 text-[0.6rem] font-semibold tracking-normal text-foreground sm:text-[0.7rem]",
            place.className,
          )}
          key={place.name}
        >
          {place.name}
        </span>
      ))}

      <span className="absolute bottom-[3%] left-[5%] text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-foreground/80 sm:text-xs">
        {label}
      </span>

      {layout === "top" ? (
        <>
          <span className="absolute bottom-[14%] left-[37%] h-[34%] w-[27%] rounded-sm border border-primary bg-primary/10" />
          <RouteOverlay />
          <span className="absolute bottom-[3%] right-[5%] text-[0.55rem] font-semibold uppercase tracking-widest text-primary sm:text-[0.65rem]">
            Step-free route
          </span>
        </>
      ) : null}
    </div>
  );
}

export function OrganizationBuildingVisual() {
  return (
    <div
      className="mt-4 w-full overflow-hidden sm:order-3 sm:mt-8 sm:overflow-visible lg:mt-10 xl:mt-12"
      aria-hidden="true"
    >
      <div className="mx-auto h-64 w-full sm:h-96 lg:h-112 xl:h-120">
        <div className="perspective-distant relative h-full w-full sm:perspective-[1500px]">
          <div className="absolute left-1/2 top-[56%] aspect-4/3 w-[min(82vw,34rem)] -translate-x-1/2 -translate-y-1/2 scale-[0.62] transform-3d sm:top-1/2 sm:scale-[0.7] lg:scale-75 xl:scale-[0.82]">
            <div className="relative h-full w-full transform-3d transform-[rotateX(52deg)_rotateZ(-38deg)]">
              <FloorPlate
                className="transform-[translateZ(0)]"
                label="Ground - Entrance"
                layout="ground"
              />
              <FloorPlate
                className="transform-[translateZ(4.5rem)] sm:transform-[translateZ(6rem)]"
                label="Level 1"
                layout="middle"
              />
              <FloorPlate
                className="transform-[translateZ(9rem)] sm:transform-[translateZ(12rem)]"
                label="Level 2"
                layout="top"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
