import { BuildingsList } from "@/features/buildings/components/BuildingsList";

import type { DashboardData } from "../types/dashboard.types";
import { OrganizationSummary } from "./OrganizationSummary";

export function DashboardShell({ data }: { data: DashboardData }) {
  return (
    <main className="mx-auto flex w-full max-w-270 flex-1 flex-col gap-9 px-4 pb-16 pt-8 sm:px-6 sm:pt-10 lg:px-8">
      <OrganizationSummary organization={data.organization} userRole={data.user.role} />
      <BuildingsList buildings={data.buildings} canManage={data.canManage} />
    </main>
  );
}
