import { Building2 } from "lucide-react";

import IsometricPlate, { PlateRooms } from "../IsometricPlate";
import IsometricScene, { IsometricTiltGroup } from "../IsometricScene";

/** Two stacked plates (same translateZ-layering technique as the public home hero) — a portfolio of buildings, not one room. */
const RegisterOrganizationIllustration = () => {
  return (
    <IsometricScene>
      <IsometricTiltGroup>
        <IsometricPlate className="inset-0 transform-[translateZ(0)]" dimmed label="Building A">
          <PlateRooms revealCount={3} />
        </IsometricPlate>
        <IsometricPlate className="inset-0 transform-[translateZ(3rem)]" label="Building B">
          <PlateRooms />
          <span className="absolute left-[49%] top-[19%] flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
            <Building2 aria-hidden className="size-4" />
          </span>
        </IsometricPlate>
      </IsometricTiltGroup>
    </IsometricScene>
  );
};

export default RegisterOrganizationIllustration;
