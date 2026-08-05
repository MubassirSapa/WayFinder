import { cn } from "@/lib/utils";

type FloorPlanPreviewProps = {
  imageUrl: string | null;
  name: string;
  compact?: boolean;
  floorCount?: number;
};

export function FloorPlanPreview({
  imageUrl,
  name,
  compact = false,
  floorCount = 1,
}: FloorPlanPreviewProps) {
  if (imageUrl) {
    return (
      <div
        aria-label={`${name} map preview`}
        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 sm:group-hover:scale-105"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
    );
  }

  return (
    <div
      aria-label={`${name} map preview`}
      className="absolute inset-0 overflow-hidden bg-muted"
    >
      <span className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[28px_28px] opacity-20" />
      <span className="perspective-distant absolute inset-0">
        <span
          className={cn(
            "absolute left-1/2 top-1/2 block aspect-4/3 -translate-x-1/2 -translate-y-1/2 transform-3d transform-[rotateX(54deg)_rotateZ(-34deg)]",
            compact ? "w-[88%]" : "w-[74%]",
          )}
        >
          {floorCount > 1 ? (
            <MapPreviewPlate className="translate-x-2 translate-y-5" />
          ) : null}
          <MapPreviewPlate className={floorCount > 1 ? "-translate-x-1 -translate-y-1" : ""} active />
        </span>
      </span>
    </div>
  );
}

function MapPreviewPlate({ className, active = false }: { className?: string; active?: boolean }) {
  return (
    <span
      className={cn(
        "absolute inset-0 block rounded-sm border bg-card shadow-md",
        active ? "border-primary/45" : "border-foreground/15",
        className,
      )}
    >
      <span className="absolute left-[7%] top-[10%] h-[35%] w-[38%] rounded-xs border border-border bg-background/70" />
      <span className="absolute right-[7%] top-[10%] h-[35%] w-[36%] rounded-xs border border-border bg-background/70" />
      <span className="absolute bottom-[10%] left-[7%] h-[34%] w-[29%] rounded-xs border border-border bg-background/70" />
      <span className="absolute bottom-[10%] right-[7%] h-[34%] w-[52%] rounded-xs border border-border bg-background/70" />
      {active ? (
        <>
          <span className="absolute left-[57%] top-[22%] h-px w-[22%] bg-primary" />
          <span className="absolute left-[56%] top-[20%] size-1.5 rounded-full bg-primary" />
        </>
      ) : null}
    </span>
  );
}
