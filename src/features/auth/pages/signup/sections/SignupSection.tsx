import { Sparkles } from "lucide-react";

import AuthSplitFrame from "@/features/auth/shared/AuthSplitFrame";
import AuthHeroVisual from "@/features/auth/shared/illustrations/AuthHeroVisual";

import SignupForm from "../forms/SignupForm";

const SignupSection = () => {
  return (
    <AuthSplitFrame
      illustration={
        <AuthHeroVisual
          badgeLabel="Getting started"
          destinationLabel="First floor"
          floorLabel="Draft - Unsaved"
          markerIcon={Sparkles}
        />
      }
      illustrationHeadline="Build your first floor, one room at a time."
      illustrationSide="right"
    >
      <SignupForm />
    </AuthSplitFrame>
  );
};

export default SignupSection;
