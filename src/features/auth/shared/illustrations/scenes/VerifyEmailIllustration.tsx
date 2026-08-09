import { BadgeCheck } from "lucide-react";

import IsometricPlate, { PlateRooms } from "../IsometricPlate";
import IsometricScene, { IsometricTiltGroup } from "../IsometricScene";

/** A single room gets a checkmark stamp — no route at all, just one confirmed room. */
const VerifyEmailIllustration = () => {
  return (
    <IsometricScene>
      <IsometricTiltGroup>
        <IsometricPlate className="inset-0" label="Ground - Entrance">
          <PlateRooms />

          <span className="absolute left-[6%] top-[7%] flex h-[34%] w-[39%] items-center justify-center">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
              <BadgeCheck aria-hidden className="size-5" />
            </span>
          </span>
        </IsometricPlate>
      </IsometricTiltGroup>
    </IsometricScene>
  );
};

export default VerifyEmailIllustration;
