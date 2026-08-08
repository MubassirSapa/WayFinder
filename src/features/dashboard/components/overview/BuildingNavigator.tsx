import Image from "next/image";
import Link from "next/link";
import { Building2Icon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PRIVATE_ROUTES } from "@/constants/routes";
import type { BuildingListItem } from "@/features/buildings/types/buildings.types";

import { DASHBOARD_CLIENT, MAX_BUILDINGS_SHOWN } from "../../constants/dashboard.constants";
import { DashboardSectionHeader } from "./DashboardSectionHeader";

export function BuildingNavigator({ buildings }: { buildings: BuildingListItem[] }) {
  return (
    <section aria-labelledby="building-navigator-title">
      <DashboardSectionHeader
        id="building-navigator-title"
        title={DASHBOARD_CLIENT.BUILDINGS_TITLE}
        description={DASHBOARD_CLIENT.BUILDINGS_DESCRIPTION}
        action={buildings.length > MAX_BUILDINGS_SHOWN ? (
          <Button nativeButton={false} render={<Link href={PRIVATE_ROUTES.BUILDINGS} />} variant="outline" className="h-10 px-4">
            {DASHBOARD_CLIENT.VIEW_ALL}
          </Button>
        ) : undefined}
      />
      <div className="mt-4 grid gap-2">
        {buildings.length > 0 ? buildings.slice(0, MAX_BUILDINGS_SHOWN).map((building) => (
          <Link
            key={building.id}
            href={`${PRIVATE_ROUTES.BUILDINGS}/${building.id}`}
            className="group flex min-h-16 items-center gap-3 rounded-lg border border-border bg-card px-3 py-3 shadow-sm transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            <span className="relative grid size-9 shrink-0 place-content-center overflow-hidden rounded-md border border-border bg-muted text-muted-foreground">
              {building.logoUrl ? (
                <Image
                  alt={building.name}
                  src={building.logoUrl}
                  fill
                  sizes="36px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <Building2Icon className="size-4" aria-hidden="true" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-heading text-sm font-semibold">{building.name}</span>
              <span className="mt-1 block truncate text-xs text-muted-foreground">
                {building.floorCount} {building.floorCount === 1 ? DASHBOARD_CLIENT.FLOOR : DASHBOARD_CLIENT.FLOORS}
                {building.address ? ` - ${building.address}` : ""}
              </span>
            </span>
            <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground" aria-hidden="true" />
          </Link>
        )) : (
          <p className="py-5 text-sm text-muted-foreground">{DASHBOARD_CLIENT.NO_BUILDINGS}</p>
        )}
      </div>
    </section>
  );
}
