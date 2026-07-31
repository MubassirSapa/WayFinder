import Link from "next/link";
import { PencilIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { buildOrgAdminHref, DASHBOARD_CLIENT } from "../constants/dashboard.constants";
import type { DashboardOrganization } from "../types/dashboard.types";

type OrganizationSummaryProps = {
  organization: DashboardOrganization;
};

export function OrganizationSummary({ organization }: OrganizationSummaryProps) {
  return (
    <section className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7 lg:flex-row lg:items-center">
      <span className="grid size-16 shrink-0 place-content-center rounded-2xl border border-primary/20 bg-primary/15 font-heading text-xl font-semibold tracking-tight text-primary sm:size-18">
        {organization.initials}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            {organization.name}
          </h1>
          <Badge variant="outline" className="uppercase tracking-wide">
            {organization.typeLabel}
          </Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{DASHBOARD_CLIENT.ORG_BUILDING}</p>
      </div>

      {organization.id ? (
        <Button
          nativeButton={false}
          render={<Link href={buildOrgAdminHref(organization.id)} />}
          variant="outline"
          size="lg"
          className="h-10 self-start lg:self-auto"
        >
          <PencilIcon />
          {DASHBOARD_CLIENT.ORG_EDIT}
        </Button>
      ) : null}
    </section>
  );
}
