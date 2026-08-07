import { MailIcon } from "lucide-react";

import { USER_MANAGEMENT_CLIENT } from "../constants/user-management.constants";
import type { OrgUserDetail } from "../types/user-management.types";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

type UserInviteStatusProps = {
  inviteHistory: OrgUserDetail["inviteHistory"];
};

export function UserInviteStatus({ inviteHistory }: UserInviteStatusProps) {
  return (
    <section>
      <h3 className="flex items-center gap-1.5 border-b border-border pb-2 font-heading text-sm font-semibold">
        <MailIcon className="size-4 text-muted-foreground" aria-hidden="true" />
        {USER_MANAGEMENT_CLIENT.INVITE_STATUS_TITLE}
      </h3>
      <div className="mt-4 text-sm text-muted-foreground">
        {inviteHistory ? (
          <div className="space-y-1">
            <p>
              {USER_MANAGEMENT_CLIENT.INVITE_STATUS_INVITED_BY}{" "}
              <span className="font-medium text-foreground">{inviteHistory.invitedByName}</span>
              {" · "}
              {formatDate(inviteHistory.invitedAt)}
            </p>
            {inviteHistory.acceptedAt ? (
              <p>
                {USER_MANAGEMENT_CLIENT.INVITE_STATUS_ACCEPTED_AT}{" "}
                <span className="font-medium text-foreground">{formatDate(inviteHistory.acceptedAt)}</span>
              </p>
            ) : null}
          </div>
        ) : (
          <p>{USER_MANAGEMENT_CLIENT.INVITE_STATUS_NONE}</p>
        )}
      </div>
    </section>
  );
}
