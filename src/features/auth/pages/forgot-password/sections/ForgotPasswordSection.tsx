import { Search } from "lucide-react";

import AuthSplitFrame from "@/features/auth/shared/AuthSplitFrame";
import AuthHeroVisual from "@/features/auth/shared/illustrations/AuthHeroVisual";

import ForgotPasswordForm from "../forms/ForgotPasswordForm";

const ForgotPasswordSection = () => {
  return (
    <AuthSplitFrame
      illustration={
        <AuthHeroVisual
          badgeLabel="Searching"
          destinationLabel="Reception"
          floorLabel="Ground - Entrance"
          markerIcon={Search}
        />
      }
      illustrationHeadline="Lost the way in? We'll help you find it."
      illustrationSide="right"
    >
      <ForgotPasswordForm />
    </AuthSplitFrame>
  );
};

export default ForgotPasswordSection;
