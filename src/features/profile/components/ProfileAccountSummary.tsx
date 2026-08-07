import { MailIcon, ShieldCheckIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { PROFILE_CLIENT } from "../constants/profile.constants";

type ProfileAccountSummaryProps = {
  email: string;
  roleLabel: string;
};

export function ProfileAccountSummary({ email, roleLabel }: ProfileAccountSummaryProps) {
  return (
    <dl className="divide-y divide-border rounded-md border border-border bg-muted/10">
      <div className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-2 px-3 py-3 sm:grid-cols-[1.75rem_5rem_minmax(0,1fr)] sm:items-center">
        <MailIcon className="mt-0.5 size-4 text-muted-foreground sm:mt-0" aria-hidden="true" />
        <dt className="font-mono text-[0.625rem] uppercase tracking-[0.1em] text-muted-foreground">
          {PROFILE_CLIENT.FIELD_EMAIL_LABEL}
        </dt>
        <dd className="col-start-2 mt-1 min-w-0 break-words text-xs font-medium sm:col-start-3 sm:mt-0">
          {email}
        </dd>
      </div>

      <div className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-2 px-3 py-3 sm:grid-cols-[1.75rem_5rem_minmax(0,1fr)] sm:items-center">
        <ShieldCheckIcon className="mt-0.5 size-4 text-muted-foreground sm:mt-0" aria-hidden="true" />
        <dt className="font-mono text-[0.625rem] uppercase tracking-[0.1em] text-muted-foreground">
          {PROFILE_CLIENT.FIELD_ROLE_LABEL}
        </dt>
        <dd className="col-start-2 mt-1 sm:col-start-3 sm:mt-0">
          <Badge className="font-mono text-[0.625rem] uppercase tracking-wide" variant="secondary">
            {roleLabel}
          </Badge>
        </dd>
      </div>
    </dl>
  );
}
