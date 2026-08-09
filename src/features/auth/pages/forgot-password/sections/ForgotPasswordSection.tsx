import AuthSplitFrame from "@/features/auth/shared/AuthSplitFrame";
import ForgotPasswordIllustration from "@/features/auth/shared/illustrations/scenes/ForgotPasswordIllustration";

import ForgotPasswordForm from "../forms/ForgotPasswordForm";

const ForgotPasswordSection = () => {
  return (
    <AuthSplitFrame
      illustration={<ForgotPasswordIllustration />}
      illustrationHeadline={
        <>
          Lost the way in? We&apos;ll help you <span className="text-primary">find it</span>.
        </>
      }
      illustrationSide="right"
    >
      <ForgotPasswordForm />
    </AuthSplitFrame>
  );
};

export default ForgotPasswordSection;
