import AuthSplitFrame from "@/features/auth/shared/AuthSplitFrame";
import RegisterOrganizationIllustration from "@/features/auth/shared/illustrations/scenes/RegisterOrganizationIllustration";

import RegisterOrganizationForm from "../forms/RegisterOrganizationForm";

const RegisterOrganizationSection = () => {
  return (
    <AuthSplitFrame
      illustration={<RegisterOrganizationIllustration />}
      illustrationHeadline={
        <>
          One account, <span className="text-primary">every building</span> you manage.
        </>
      }
      illustrationSide="left"
    >
      <RegisterOrganizationForm />
    </AuthSplitFrame>
  );
};

export default RegisterOrganizationSection;
