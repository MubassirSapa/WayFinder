import { cn } from "@/lib/utils";

export const PLATE_ROOM_LAYOUTS = [
  "left-[6%] top-[7%] h-[34%] w-[39%]",
  "right-[6%] top-[7%] h-[34%] w-[40%]",
  "bottom-[7%] left-[6%] h-[38%] w-[27%]",
  "bottom-[7%] left-[37%] h-[38%] w-[27%]",
  "bottom-[7%] right-[6%] h-[38%] w-[26%]",
] as const;

/**
 * The tilted floor-plate "card" shared by every auth illustration — same
 * perspective/rotate technique as the public home hero (ViewerHeroVisual),
 * factored out here so every scene composes it instead of copy-pasting the
 * transform and border/shadow treatment.
 */
const IsometricPlate = ({ children, className, dimmed = false, label }: TProps) => {
  return (
    <div
      className={cn(
        "absolute rounded-md border-2 bg-card ring-1",
        dimmed
          ? "border-foreground/30 opacity-80 ring-foreground/15"
          : "border-primary/70 shadow-[0_0_28px_-8px_var(--primary)] ring-primary/25",
        className,
      )}
    >
      {children}
      {label && (
        <span className="absolute bottom-[3%] left-[5%] text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-foreground/80">
          {label}
        </span>
      )}
    </div>
  );
};

export default IsometricPlate;

/** The plate's five room rectangles, optionally revealed with a staggered mount animation. */
export const PlateRooms = ({ animate = false, revealCount = PLATE_ROOM_LAYOUTS.length }: PlateRoomsProps) => {
  return (
    <>
      {PLATE_ROOM_LAYOUTS.map((roomClassName, index) => (
        <span
          className={cn(
            "absolute rounded-sm border border-foreground/25 bg-background",
            index >= revealCount && "opacity-0",
            animate && index < revealCount && "animate-in fade-in zoom-in-95 fill-mode-both",
            roomClassName,
          )}
          key={roomClassName}
          style={
            animate && index < revealCount
              ? { animationDelay: `${300 + index * 150}ms`, animationDuration: "500ms" }
              : undefined
          }
        />
      ))}
    </>
  );
};

type TProps = {
  children?: React.ReactNode;
  className?: string;
  /** A muted, low-opacity plate — for a scene representing an unclear or lost state. */
  dimmed?: boolean;
  /** Caption pinned to the plate's bottom-left corner, e.g. "Ground - Entrance." */
  label?: string;
};

type PlateRoomsProps = {
  animate?: boolean;
  revealCount?: number;
};
