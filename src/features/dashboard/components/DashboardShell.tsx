import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  Building2Icon,
  LandmarkIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";

import { PRIVATE_ROUTES } from "@/constants/routes";

import { DASHBOARD_CLIENT } from "../constants/dashboard.constants";
import type { DashboardData } from "../types/dashboard.types";
import { DashboardPageContainer, DashboardPageHeader } from "./DashboardPageHeader";
import { OrganizationInfoCard } from "./OrganizationInfoCard";

export function DashboardShell({ data }: { data: DashboardData }) {
  const totalFloors = data.buildings.reduce(
    (total, building) => total + building.floorCount,
    0,
  );
  const links = [
    ...(data.canManage
      ? [
          {
            href: PRIVATE_ROUTES.ORGANIZATION,
            title: DASHBOARD_CLIENT.MANAGE_ORGANIZATION,
            description: DASHBOARD_CLIENT.MANAGE_ORGANIZATION_DESC,
            icon: LandmarkIcon,
          },
        ]
      : []),
    {
      href: PRIVATE_ROUTES.BUILDINGS,
      title: DASHBOARD_CLIENT.MANAGE_BUILDINGS,
      description: DASHBOARD_CLIENT.MANAGE_BUILDINGS_DESC,
      icon: Building2Icon,
    },
    ...(data.canManage
      ? [
          {
            href: PRIVATE_ROUTES.USERS,
            title: DASHBOARD_CLIENT.MANAGE_USERS,
            description: DASHBOARD_CLIENT.MANAGE_USERS_DESC,
            icon: UsersIcon,
          },
        ]
      : []),
    {
      href: PRIVATE_ROUTES.PROFILE,
      title: DASHBOARD_CLIENT.MANAGE_PROFILE,
      description: DASHBOARD_CLIENT.MANAGE_PROFILE_DESC,
      icon: UserIcon,
    },
  ];

  return (
    <DashboardPageContainer>
      <DashboardPageHeader
        title={`Welcome, ${data.user.name}`}
        description={DASHBOARD_CLIENT.PAGE_DESCRIPTION}
      />

      <OrganizationInfoCard
        name={data.organization.name}
        typeLabel={data.organization.typeLabel}
        logoUrl={data.organization.logoUrl}
      >
        <dl className="grid grid-cols-3 divide-x divide-border border-y border-border">
          <OverviewMetric
            label={DASHBOARD_CLIENT.BUILDINGS_LABEL}
            value={data.buildings.length}
          />
          <OverviewMetric label={DASHBOARD_CLIENT.FLOORS_LABEL} value={totalFloors} />
          <OverviewMetric
            label={DASHBOARD_CLIENT.ROLE_LABEL}
            value={<span className="capitalize">{data.user.role}</span>}
          />
        </dl>
      </OrganizationInfoCard>

      <section aria-labelledby="workspace-links-title">
        <div className="mb-4">
          <h2 id="workspace-links-title" className="font-heading text-lg font-semibold">
            {DASHBOARD_CLIENT.OVERVIEW_TITLE}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {DASHBOARD_CLIENT.OVERVIEW_DESCRIPTION}
          </p>
        </div>

        <div className="grid border-y border-border sm:grid-cols-2">
          {links.map(({ href, title, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex min-h-24 items-center gap-4 border-b border-border px-1 py-4 transition-colors last:border-b-0 hover:bg-muted/30 sm:px-4 sm:odd:border-e sm:[&:nth-last-child(-n+2)]:border-b-0"
            >
              <span className="grid size-10 shrink-0 place-content-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                <Icon className="size-4.5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-heading text-sm font-semibold">{title}</span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                  {description}
                </span>
              </span>
              <ArrowRightIcon
                className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </section>
    </DashboardPageContainer>
  );
}

function OverviewMetric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0 px-3 py-4 text-center sm:px-5 sm:text-left">
      <dt className="text-[0.6875rem] font-medium uppercase text-muted-foreground">{label}</dt>
      <dd className="mt-1 truncate font-heading text-xl font-semibold">{value}</dd>
    </div>
  );
}
