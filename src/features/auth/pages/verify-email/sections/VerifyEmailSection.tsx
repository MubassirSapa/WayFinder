import Link from "next/link";
import { BadgeCheck } from "lucide-react";

import FormCard from "@/components/shared/form/FormCard";
import { Button } from "@/components/ui/button";
import { VERIFY_EMAIL_CLIENT as CLIENT } from "@/features/auth/constants/verify-email";
import AuthSplitFrame from "@/features/auth/shared/AuthSplitFrame";
import AuthHeroVisual from "@/features/auth/shared/illustrations/AuthHeroVisual";
import { PUBLIC_ROUTES } from "@/constants/routes";

const VerifyEmailSection = ({ isVerified }: TProps) => {
  return (
    <AuthSplitFrame
      illustration={
        <AuthHeroVisual
          badgeLabel="Confirmed"
          destinationLabel="Reception"
          floorLabel="Ground - Entrance"
          markerIcon={BadgeCheck}
        />
      }
      illustrationHeadline="One click and you're confirmed."
      illustrationSide="left"
    >
      <FormCard
        title={isVerified ? CLIENT.SUCCESS_TITLE : CLIENT.ERROR_TITLE}
        description={isVerified ? CLIENT.SUCCESS_DESC : CLIENT.ERROR_DESC}
        align="center"
        plain
        footer={
          <Button
            nativeButton={false}
            render={<Link href={isVerified ? PUBLIC_ROUTES.SIGNIN : PUBLIC_ROUTES.HOME} />}
            size="lg"
            className="h-10 w-full rounded-lg text-sm font-semibold"
          >
            {isVerified ? CLIENT.SIGNIN_CTA : CLIENT.HOME_CTA}
          </Button>
        }
      />
    </AuthSplitFrame>
  );
};

export default VerifyEmailSection;

type TProps = {
  isVerified: boolean;
};
