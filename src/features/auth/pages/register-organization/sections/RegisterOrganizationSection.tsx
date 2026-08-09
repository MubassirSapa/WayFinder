import { Building2 } from "lucide-react";

import AuthSplitFrame from "@/features/auth/shared/AuthSplitFrame";
import AuthHeroVisual from "@/features/auth/shared/illustrations/AuthHeroVisual";

import RegisterOrganizationForm from "../forms/RegisterOrganizationForm";

const RegisterOrganizationSection = () => {
  return (
    <AuthSplitFrame
      illustration={
        <AuthHeroVisual
          badgeLabel="New organization"
          destinationLabel="Head office"
          floorLabel="Building - Overview"
          markerIcon={Building2}
        />
      }
      illustrationHeadline="One account, every building you manage."
      illustrationSide="left"
    >
      <RegisterOrganizationForm />
    </AuthSplitFrame>
  );
};

export default RegisterOrganizationSection;
