import AuthHeroVisual from "@/features/auth/shared/illustrations/AuthHeroVisual";
import AuthSplitFrame from "@/features/auth/shared/AuthSplitFrame";

import SigninForm from "../forms/SigninForm";

const SigninSection = () => {
  return (
    <AuthSplitFrame
      illustration={
        <AuthHeroVisual
          badgeLabel="You are here"
          destinationLabel="Reception"
          floorLabel="Ground - Entrance"
        />
      }
      illustrationHeadline="Find your way in, every time."
      illustrationSide="left"
    >
      <SigninForm />
    </AuthSplitFrame>
  );
};

export default SigninSection;
