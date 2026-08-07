import { MailIcon, PencilIcon, ShieldCheckIcon, UserRoundIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { PROFILE_CLIENT } from "../constants/profile.constants";
import type { ProfileEditData } from "../types/profile.types";

type ProfileDetailsViewProps = {
  profile: ProfileEditData;
  roleLabel: string;
  onEdit: () => void;
};

const DETAIL_ROWS = [
  { key: "name", label: PROFILE_CLIENT.FIELD_NAME_LABEL, icon: UserRoundIcon },
  { key: "email", label: PROFILE_CLIENT.FIELD_EMAIL_LABEL, icon: MailIcon },
  { key: "role", label: PROFILE_CLIENT.FIELD_ROLE_LABEL, icon: ShieldCheckIcon },
] as const;

export function ProfileDetailsView({ profile, roleLabel, onEdit }: ProfileDetailsViewProps) {
  const values = {
    name: profile.name,
    email: profile.email,
    role: roleLabel,
  };

  return (
    <section>
      <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3 sm:px-5">
        <div>
          <h3 className="text-sm font-semibold">{PROFILE_CLIENT.DETAILS_TITLE}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{PROFILE_CLIENT.DETAILS_DESCRIPTION}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onEdit}
          className="h-11 shrink-0 px-3 sm:h-8"
        >
          <PencilIcon />
          <span className="hidden sm:inline">{PROFILE_CLIENT.EDIT}</span>
          <span className="sr-only sm:hidden">{PROFILE_CLIENT.EDIT}</span>
        </Button>
      </div>

      <dl className="divide-y divide-border">
        {DETAIL_ROWS.map(({ key, label, icon: Icon }) => (
          <div
            key={key}
            className="grid grid-cols-[2rem_minmax(0,1fr)] items-center gap-x-3 px-4 py-3 sm:grid-cols-[2rem_8rem_minmax(0,1fr)] sm:px-5"
          >
            <span className="grid size-8 place-items-center rounded-md border border-border bg-muted/40 text-muted-foreground">
              <Icon className="size-3.5" aria-hidden="true" />
            </span>
            <dt className="font-mono text-[0.625rem] font-medium uppercase tracking-[0.1em] text-muted-foreground">
              {label}
            </dt>
            <dd className="col-start-2 min-w-0 break-words text-xs font-medium sm:col-start-3">
              {values[key]}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
