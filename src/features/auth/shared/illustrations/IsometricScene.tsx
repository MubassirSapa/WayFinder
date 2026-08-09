import { cn } from "@/lib/utils";

/** Outer sizing + perspective container shared by every auth illustration. */
const IsometricScene = ({ children, className }: TProps) => {
  return (
    <div aria-hidden className={cn("relative mx-auto h-80 w-full max-w-lg lg:h-96", className)}>
      <div className="perspective-distant absolute inset-0">{children}</div>
    </div>
  );
};

export default IsometricScene;

/**
 * Positions and tilts one plate group within the scene — render more than
 * one for a multi-plate composition. Drifts very slowly so the scene never
 * reads as a frozen screenshot, even before any page interaction.
 */
export const IsometricTiltGroup = ({ children, className }: TProps) => {
  return (
    <div
      className={cn(
        "absolute left-1/2 top-1/2 aspect-4/3 w-[82%] -translate-x-1/2 -translate-y-1/2 transform-3d animate-[wf-drift_10s_ease-in-out_infinite]",
        className,
      )}
    >
      <div className="relative size-full transform-3d transform-[rotateX(52deg)_rotateZ(-36deg)]">{children}</div>
    </div>
  );
};

type TProps = {
  children: React.ReactNode;
  className?: string;
};
