import Link from "next/link";
import { Building2Icon, PlusIcon, UserPlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PRIVATE_ROUTES } from "@/constants/routes";

import { DASHBOARD_CLIENT } from "../constants/dashboard.constants";
import type { DashboardData } from "../types/dashboard.types";
import { AttentionList } from "./overview/AttentionList";
import { BuildingNavigator } from "./overview/BuildingNavigator";
import { RecentFloorGrid } from "./overview/RecentFloorGrid";
import { DashboardPageContainer, DashboardPageHeader } from "./DashboardPageHeader";

export function DashboardShell({ data }: { data: DashboardData }) {
  return (
    <DashboardPageContainer>
      <DashboardPageHeader
        title={DASHBOARD_CLIENT.PAGE_TITLE}
        description={`${data.organization.name} - ${DASHBOARD_CLIENT.PAGE_DESCRIPTION}`}
        action={
          <div className="flex w-full gap-2 sm:w-auto">
            {data.canManage ? (
              <Button
                nativeButton={false}
                render={<Link href={PRIVATE_ROUTES.USERS} />}
                variant="outline"
                className="h-10 flex-1 px-4 sm:flex-none"
              >
                <UserPlusIcon />
                {DASHBOARD_CLIENT.INVITE_PEOPLE}
              </Button>
            ) : null}
            <Button
              nativeButton={false}
              render={<Link href={PRIVATE_ROUTES.BUILDINGS} />}
              className="h-10 flex-1 px-4 sm:flex-none"
            >
              <PlusIcon />
              {DASHBOARD_CLIENT.ADD_FLOOR}
            </Button>
          </div>
        }
      />


      <RecentFloorGrid floors={data.floors.slice(0, 4)} />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.75fr)] lg:items-start">
        <AttentionList floors={data.floors} />

        <aside className="grid gap-8" aria-label={DASHBOARD_CLIENT.WORKSPACE_SUMMARY}>
          <BuildingNavigator buildings={data.buildings} />
          {!data.canManage ? (
            <div className="flex items-start gap-3 border-t border-border pt-5">
              <span className="grid size-9 shrink-0 place-content-center rounded-md bg-muted text-muted-foreground">
                <Building2Icon className="size-4" aria-hidden="true" />
              </span>
              <p className="text-sm leading-6 text-muted-foreground">
                {DASHBOARD_CLIENT.MEMBER_ACCESS_NOTE}
              </p>
            </div>
          ) : null}
        </aside>
      </div>
    </DashboardPageContainer>
  );
}
