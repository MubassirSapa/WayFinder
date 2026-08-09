import Link from "next/link";

import FormCard from "@/components/shared/form/FormCard";
import { Button } from "@/components/ui/button";
import AuthSplitFrame from "@/features/auth/shared/AuthSplitFrame";
import InviteAcceptIllustration from "@/features/auth/shared/illustrations/scenes/InviteAcceptIllustration";

import { INVITATIONS_CLIENT as CLIENT } from "../../constants/invitations.constants";
import type { InvitationPreview } from "../../types/invitation.types";
import InviteAcceptForm from "./forms/InviteAcceptForm";

type TProps = {
  token?: string;
  preview: InvitationPreview | null;
};

const inviteIllustration = <InviteAcceptIllustration />;

const InviteAcceptSection = ({ token, preview }: TProps) => {
  if (!token || !preview) {
    return (
      <AuthSplitFrame
        illustration={inviteIllustration}
        illustrationHeadline="You've been routed to the team."
        illustrationSide="right"
      >
        <FormCard
          title={CLIENT.INVALID_INVITE_TITLE}
          description={CLIENT.INVALID_INVITE_DESC}
          showBack={false}
          align="center"
          plain
          footer={
            <Button
              nativeButton={false}
              render={<Link href={CLIENT.SIGNIN_HREF} />}
              size="lg"
              className="h-10 w-full rounded-md text-sm font-semibold"
            >
              {CLIENT.SIGNIN_CTA}
            </Button>
          }
        />
      </AuthSplitFrame>
    );
  }

  return (
    <AuthSplitFrame
      illustration={inviteIllustration}
      illustrationHeadline="You've been routed to the team."
      illustrationSide="right"
    >
      <InviteAcceptForm token={token} preview={preview} />
    </AuthSplitFrame>
  );
};

export default InviteAcceptSection;
