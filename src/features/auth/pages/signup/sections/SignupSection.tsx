import AuthSplitFrame from "@/features/auth/shared/AuthSplitFrame";
import SignupIllustration from "@/features/auth/shared/illustrations/scenes/SignupIllustration";

import SignupForm from "../forms/SignupForm";

const SignupSection = () => {
  return (
    <AuthSplitFrame
      illustration={<SignupIllustration />}
      illustrationHeadline="Build your first floor, one room at a time."
      illustrationSide="right"
    >
      <SignupForm />
    </AuthSplitFrame>
  );
};

export default SignupSection;
