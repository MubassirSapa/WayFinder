import Link from "next/link";
import { BadgeCheckIcon, BadgeXIcon } from "lucide-react";

import FormCard from "@/components/shared/form/FormCard";
import { Button } from "@/components/ui/button";
import { VERIFY_EMAIL_CLIENT as CLIENT } from "@/features/auth/constants/verify-email";
import { PUBLIC_ROUTES } from "@/constants/routes";

const VerifyEmailSection = ({ isVerified }: TProps) => {
  return (
    <FormCard
      title={isVerified ? CLIENT.SUCCESS_TITLE : CLIENT.ERROR_TITLE}
      description={isVerified ? CLIENT.SUCCESS_DESC : CLIENT.ERROR_DESC}
      showBack={false}
      align="center"
      icon={
        isVerified ? (
          <BadgeCheckIcon className="size-8 text-primary" strokeWidth={1.75} />
        ) : (
          <BadgeXIcon className="size-8 text-destructive" strokeWidth={1.75} />
        )
      }
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
  );
};

export default VerifyEmailSection;

type TProps = {
  isVerified: boolean;
};
