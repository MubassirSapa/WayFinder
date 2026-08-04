import { Badge } from "@/components/ui/badge";

import { visitorAddressSummary } from "../lib/profile-presentation";
import type { OrganizationProfile } from "../types/profile.types";

export function ProfileSummary({ organization }: { organization: OrganizationProfile }) {
  const location = visitorAddressSummary(organization.address.city, organization.address.country);

  return (
    <section className="flex items-center gap-4 border-y border-border py-5 sm:rounded-xl sm:border sm:bg-card sm:px-5 sm:shadow-sm">
      <span
        className="grid size-14 shrink-0 place-content-center rounded-xl bg-primary/15 font-heading text-lg font-semibold text-primary"
        aria-hidden
      >
        {organization.initials}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="truncate font-heading text-lg font-semibold tracking-tight">
            {organization.name}
          </h2>
          <Badge variant="outline">{organization.typeLabel}</Badge>
        </div>
        <p className="mt-1 truncate text-sm text-muted-foreground">{location}</p>
      </div>
    </section>
  );
}
