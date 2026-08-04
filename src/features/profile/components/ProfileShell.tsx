import { MailIcon } from "lucide-react";

import type { ProfileData } from "../types/profile.types";
import { PROFILE_CLIENT } from "../constants/profile.constants";
import { ProfileForm } from "./ProfileForm";
import { ProfileSummary } from "./ProfileSummary";
import { ProfileTopbar } from "./ProfileTopbar";

export function ProfileShell({ data }: { data: ProfileData }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <ProfileTopbar />
      <main className="mx-auto w-full max-w-4xl px-4 pb-8 pt-7 sm:px-6 sm:pb-12 sm:pt-10">
        <div className="max-w-3xl">
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            {PROFILE_CLIENT.PAGE_TITLE}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            {PROFILE_CLIENT.PAGE_DESCRIPTION}
          </p>
        </div>

        <div className="mt-6 max-w-3xl space-y-5">
          <ProfileSummary organization={data.organization} />
          <ProfileForm organization={data.organization} />

          <section className="rounded-xl border border-border bg-card px-4 py-5 shadow-sm sm:px-5">
            <h2 className="font-heading text-base font-semibold">{PROFILE_CLIENT.ACCOUNT_TITLE}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {PROFILE_CLIENT.ACCOUNT_DESCRIPTION}
            </p>
            <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
              <span className="grid size-11 shrink-0 place-content-center rounded-full bg-muted text-muted-foreground">
                <MailIcon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{PROFILE_CLIENT.SIGNED_IN_AS}</p>
                <p className="truncate text-sm font-medium">{data.account.name}</p>
                <p className="truncate text-sm text-muted-foreground">{data.account.email}</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
