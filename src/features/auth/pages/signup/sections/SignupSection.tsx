import AuthSplitFrame from "@/features/auth/shared/AuthSplitFrame";
import SignupIllustration from "@/features/auth/shared/illustrations/scenes/SignupIllustration";

import SignupForm from "../forms/SignupForm";

const SignupSection = () => {
  return (
    <AuthSplitFrame
      illustration={<SignupIllustration />}
      illustrationHeadline={
        <>
          Build your <span className="text-primary">first floor</span>, one room at a time.
        </>
      }
      illustrationSide="right"
    >
      <SignupForm />
    </AuthSplitFrame>
  );
};

export default SignupSection;
