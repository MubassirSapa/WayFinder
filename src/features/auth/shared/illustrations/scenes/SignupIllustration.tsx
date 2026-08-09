import { Plus, Sparkles } from "lucide-react";

import IsometricPlate, { PlateRooms } from "../IsometricPlate";
import IsometricScene, { IsometricTiltGroup } from "../IsometricScene";

/** An empty plate gaining rooms one at a time — a space being built, not arrived at. No route: nothing to travel to yet. */
const SignupIllustration = () => {
  return (
    <IsometricScene>
      <IsometricTiltGroup>
        <IsometricPlate className="inset-0" label="Draft - Unsaved">
          <PlateRooms animate />

          <span className="absolute bottom-[11%] left-[7%] flex items-center gap-1 rounded-full border border-border bg-background/90 px-2 py-1 text-[0.55rem] font-semibold text-foreground shadow-sm">
            <Sparkles aria-hidden className="size-3 text-primary" />
            New space
          </span>
          <span className="absolute left-[49%] top-[19%] flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
            <Plus aria-hidden className="size-4" />
          </span>
        </IsometricPlate>
      </IsometricTiltGroup>
    </IsometricScene>
  );
};

export default SignupIllustration;
