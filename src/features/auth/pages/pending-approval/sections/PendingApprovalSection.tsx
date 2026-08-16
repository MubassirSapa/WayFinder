"use client";

import { useTransition } from "react";

import FormCard from "@/components/shared/form/FormCard";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions/server/logout";
import { PENDING_APPROVAL_CLIENT as CLIENT } from "@/features/auth/constants/pending-approval";
import AuthSplitFrame from "@/features/auth/shared/AuthSplitFrame";
import PendingApprovalIllustration from "@/features/auth/shared/illustrations/scenes/PendingApprovalIllustration";

const PendingApprovalSection = ({ organizationName }: TProps) => {
  const [isLoggingOut, startLogout] = useTransition();

  return (
    <AuthSplitFrame
      illustration={<PendingApprovalIllustration />}
      illustrationHeadline={
        <>
          Almost there - <span className="text-primary">we&apos;re reviewing you</span>.
        </>
      }
      illustrationSide="left"
    >
      <FormCard
        title={CLIENT.TITLE(organizationName)}
        description={CLIENT.DESC}
        align="center"
        plain
        footer={
          <div className="space-y-3">
            <p className="text-center text-sm text-muted-foreground">{CLIENT.CONTACT}</p>
            <Button
              variant="outline"
              size="lg"
              className="h-10 w-full rounded-lg text-sm font-semibold"
              disabled={isLoggingOut}
              onClick={() => startLogout(async () => { await logoutAction(); })}
            >
              {CLIENT.SIGNOUT_CTA}
            </Button>
          </div>
        }
      />
    </AuthSplitFrame>
  );
};

export default PendingApprovalSection;

type TProps = {
  organizationName: string;
};
