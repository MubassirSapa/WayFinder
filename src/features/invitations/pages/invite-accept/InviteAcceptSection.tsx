import Link from "next/link";
import { TriangleAlertIcon } from "lucide-react";

import FormCard from "@/components/shared/form/FormCard";
import { Button } from "@/components/ui/button";

import { INVITATIONS_CLIENT as CLIENT } from "../../constants/invitations.constants";
import type { InvitationPreview } from "../../types/invitation.types";
import InviteAcceptForm from "./forms/InviteAcceptForm";

type TProps = {
  token?: string;
  preview: InvitationPreview | null;
};

const InviteAcceptSection = ({ token, preview }: TProps) => {
  if (!token || !preview) {
    return (
      <FormCard
        title={CLIENT.INVALID_INVITE_TITLE}
        description={CLIENT.INVALID_INVITE_DESC}
        showBack={false}
        align="center"
        icon={<TriangleAlertIcon className="size-7 text-destructive" strokeWidth={1.8} />}
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
    );
  }

  return <InviteAcceptForm token={token} preview={preview} />;
};

export default InviteAcceptSection;
