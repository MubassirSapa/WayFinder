import Link from "next/link";
import { Building2Icon, ChevronRightIcon, Layers3Icon } from "lucide-react";

import { FloorPlanPreview } from "@/components/shared/FloorPlanPreview";
import { Button } from "@/components/ui/button";
import { PRIVATE_ROUTES } from "@/constants/routes";
import { buildEditorHref } from "@/features/buildings/constants/buildings.constants";

import { DASHBOARD_CLIENT } from "../../constants/dashboard.constants";
import type { DashboardFloorOverview } from "../../types/dashboard.types";
import { DashboardSectionHeader } from "./DashboardSectionHeader";

// `floors` must arrive already sorted most-recently-updated first
// (buildDashboardFloorOverview) and capped to 4 by the caller - this
// component renders that order as-is. This section promises "pick up where
// you left off," so the floor touched last must lead, never reshuffled
// behind an older one that happens to sort first alphabetically.
export function RecentFloorGrid({ floors }: { floors: DashboardFloorOverview[] }) {
  return (
    <section aria-labelledby="recent-floor-maps-title">
      <DashboardSectionHeader
        id="recent-floor-maps-title"
        title={DASHBOARD_CLIENT.RECENT_TITLE}
        description={DASHBOARD_CLIENT.RECENT_DESCRIPTION}
        action={
          <Button
            nativeButton={false}
            render={<Link href={PRIVATE_ROUTES.BUILDINGS} />}
            variant="outline"
            className="h-10 px-4"
          >
            {DASHBOARD_CLIENT.VIEW_BUILDINGS}
          </Button>
        }
      />

      {floors.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {floors.map((floor) => (
            <Link
              key={floor.id}
              href={buildEditorHref(floor.id)}
              className="group flex min-h-48 flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            >
              <div className="relative h-28 overflow-hidden border-b border-border bg-muted">
                <FloorPlanPreview imageUrl={floor.backgroundImageUrl} name={floor.name} />
                <span
                  className="absolute right-3 top-3 grid size-7 place-content-center rounded-full border border-border bg-background/90 shadow-sm backdrop-blur-sm"
                  title={floor.status === "published" ? DASHBOARD_CLIENT.PUBLISHED : DASHBOARD_CLIENT.DRAFT}
                >
                  <span
                    className={floor.status === "published" ? "size-2.5 rounded-full bg-success" : "size-2.5 rounded-full bg-destructive"}
                    aria-hidden="true"
                  />
                  <span className="sr-only">
                    {floor.status === "published" ? DASHBOARD_CLIENT.PUBLISHED : DASHBOARD_CLIENT.DRAFT}
                  </span>
                </span>
              </div>
              <div className="flex flex-1 items-center gap-3 px-4 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-heading text-sm font-semibold">{floor.name}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {floor.buildingName} - {floor.levelLabel}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {DASHBOARD_CLIENT.UPDATED} {floor.updatedLabel}
                  </p>
                </div>
                <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-4 rounded-lg border border-dashed border-border px-5 py-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-content-center rounded-md bg-muted text-muted-foreground">
              <Layers3Icon className="size-4.5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-heading text-sm font-semibold">{DASHBOARD_CLIENT.NO_FLOORS_TITLE}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{DASHBOARD_CLIENT.NO_FLOORS_DESCRIPTION}</p>
            </div>
          </div>
          <Button nativeButton={false} render={<Link href={PRIVATE_ROUTES.BUILDINGS} />} variant="outline" className="h-10 px-4">
            <Building2Icon />
            {DASHBOARD_CLIENT.OPEN_BUILDINGS}
          </Button>
        </div>
      )}
    </section>
  );
}
