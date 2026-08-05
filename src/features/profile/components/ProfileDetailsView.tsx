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
    <section className="border-t border-border px-5 py-6 sm:px-8 sm:py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-heading text-lg font-semibold">{PROFILE_CLIENT.DETAILS_TITLE}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{PROFILE_CLIENT.DETAILS_DESCRIPTION}</p>
        </div>
        <Button type="button" variant="outline" onClick={onEdit} className="shrink-0">
          <PencilIcon />
          <span className="hidden sm:inline">{PROFILE_CLIENT.EDIT}</span>
          <span className="sr-only sm:hidden">{PROFILE_CLIENT.EDIT}</span>
        </Button>
      </div>

      <dl className="mt-6 divide-y divide-border border-y border-border">
        {DETAIL_ROWS.map(({ key, label, icon: Icon }) => (
          <div key={key} className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-3 py-4 sm:grid-cols-[2.5rem_9rem_minmax(0,1fr)]">
            <span className="grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground">
              <Icon className="size-4.5" aria-hidden="true" />
            </span>
            <dt className="text-xs font-medium uppercase text-muted-foreground sm:text-sm sm:normal-case">
              {label}
            </dt>
            <dd className="col-start-2 min-w-0 break-words text-sm font-medium sm:col-start-3">
              {values[key]}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
