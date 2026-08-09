import AuthSplitFrame from "@/features/auth/shared/AuthSplitFrame";
import ForgotPasswordIllustration from "@/features/auth/shared/illustrations/scenes/ForgotPasswordIllustration";

import ForgotPasswordForm from "../forms/ForgotPasswordForm";

const ForgotPasswordSection = () => {
  return (
    <AuthSplitFrame
      illustration={<ForgotPasswordIllustration />}
      illustrationHeadline="Lost the way in? We'll help you find it."
      illustrationSide="right"
    >
      <ForgotPasswordForm />
    </AuthSplitFrame>
  );
};

export default ForgotPasswordSection;
