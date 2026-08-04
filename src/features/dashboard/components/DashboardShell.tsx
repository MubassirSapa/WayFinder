import Link from "next/link";
import { ArrowRightIcon, Building2Icon, LandmarkIcon, UserIcon, UsersIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { PRIVATE_ROUTES } from "@/constants/routes";

import type { DashboardData } from "../types/dashboard.types";
import { DashboardPageContainer, DashboardPageHeader } from "./DashboardPageHeader";

export function DashboardShell({ data }: { data: DashboardData }) {
  const totalFloors = data.buildings.reduce((total, building) => total + building.floorCount, 0);
  const cards = [
    ...(data.canManage
      ? [{
          href: PRIVATE_ROUTES.ORGANIZATION,
          title: "Organization",
          description: `View and manage ${data.organization.name}.`,
          meta: data.organization.typeLabel,
          icon: LandmarkIcon,
          featured: true,
        }]
      : []),
    {
      href: PRIVATE_ROUTES.BUILDINGS,
      title: "Buildings",
      description: "Open buildings, floors, and indoor maps.",
      meta: `${data.buildings.length} buildings · ${totalFloors} floors`,
      icon: Building2Icon,
      featured: true,
    },
    ...(data.canManage
      ? [{
          href: PRIVATE_ROUTES.USERS,
          title: "Users",
          description: "Manage roles and building assignments.",
          meta: "Team access",
          icon: UsersIcon,
          featured: false,
        }]
      : []),
    {
      href: PRIVATE_ROUTES.PROFILE,
      title: "Profile",
      description: "Update your name and profile image.",
      meta: data.user.email,
      icon: UserIcon,
      featured: false,
    },
  ];

  return (
    <DashboardPageContainer>
      <DashboardPageHeader
        title={`Welcome, ${data.user.name}`}
        description="Choose an area to manage your Wayfinder workspace."
      />
      <div className="grid grid-flow-row-dense gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ href, title, description, meta, icon: Icon, featured }) => (
          <Link key={href} href={href} className={featured ? "lg:col-span-2" : undefined}>
            <Card className="group h-full gap-5 p-6 transition-colors hover:border-primary/40">
              <div className="flex items-start justify-between gap-4">
                <span className="grid size-11 place-content-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="size-5" />
                </span>
                <ArrowRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
              </div>
              <div className="mt-auto">
                <h2 className="font-heading text-xl font-semibold tracking-tight">{title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                <p className="mt-4 truncate text-xs font-medium text-foreground">{meta}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </DashboardPageContainer>
  );
}
