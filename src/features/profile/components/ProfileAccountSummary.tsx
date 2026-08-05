import { MailIcon, ShieldCheckIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { PROFILE_CLIENT } from "../constants/profile.constants";

type ProfileAccountSummaryProps = {
  email: string;
  roleLabel: string;
};

export function ProfileAccountSummary({ email, roleLabel }: ProfileAccountSummaryProps) {
  return (
    <dl className="divide-y divide-border border-y border-border">
      <div className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-2 py-3.5 sm:grid-cols-[1.75rem_6rem_minmax(0,1fr)] sm:items-center">
        <MailIcon className="mt-0.5 size-4 text-muted-foreground sm:mt-0" aria-hidden="true" />
        <dt className="text-xs text-muted-foreground sm:text-sm">
          {PROFILE_CLIENT.FIELD_EMAIL_LABEL}
        </dt>
        <dd className="col-start-2 mt-1 min-w-0 break-words text-sm font-medium sm:col-start-3 sm:mt-0">
          {email}
        </dd>
      </div>

      <div className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-2 py-3.5 sm:grid-cols-[1.75rem_6rem_minmax(0,1fr)] sm:items-center">
        <ShieldCheckIcon className="mt-0.5 size-4 text-muted-foreground sm:mt-0" aria-hidden="true" />
        <dt className="text-xs text-muted-foreground sm:text-sm">
          {PROFILE_CLIENT.FIELD_ROLE_LABEL}
        </dt>
        <dd className="col-start-2 mt-1 sm:col-start-3 sm:mt-0">
          <Badge variant="secondary">{roleLabel}</Badge>
        </dd>
      </div>
    </dl>
  );
}
