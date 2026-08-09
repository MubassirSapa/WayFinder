import AuthSplitFrame from "@/features/auth/shared/AuthSplitFrame";
import ResetPasswordIllustration from "@/features/auth/shared/illustrations/scenes/ResetPasswordIllustration";

import ResetPasswordForm from "../forms/ResetPasswordForm";

const ResetPasswordSection = ({ token }: TProps) => {
  return (
    <AuthSplitFrame
      illustration={<ResetPasswordIllustration />}
      illustrationHeadline="Set a new path forward."
      illustrationSide="left"
    >
      <ResetPasswordForm token={token} />
    </AuthSplitFrame>
  );
};

export default ResetPasswordSection;

type TProps = {
  token?: string;
};
