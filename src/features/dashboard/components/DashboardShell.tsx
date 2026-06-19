import type { DashboardData } from "../types/dashboard.types";
import { DashboardTopbar } from "./DashboardTopbar";
import { FloorList } from "./FloorList";
import { OrganizationSummary } from "./OrganizationSummary";

export function DashboardShell({ data }: { data: DashboardData }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <DashboardTopbar user={data.user} />

      <main className="mx-auto flex w-full max-w-[1080px] flex-1 flex-col gap-9 px-4 pb-16 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        <OrganizationSummary organization={data.organization} />
        <FloorList
          floors={data.floors}
          buildingId={data.buildingId}
          organizationName={data.organization.name}
        />
      </main>
    </div>
  );
}
