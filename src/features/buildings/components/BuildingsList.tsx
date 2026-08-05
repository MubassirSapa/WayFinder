import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, Building2Icon, Layers3Icon, MapPinIcon } from "lucide-react";

import { PRIVATE_ROUTES } from "@/constants/routes";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";

import { BUILDINGS_CLIENT } from "../constants/buildings.constants";
import type { BuildingListItem } from "../types/buildings.types";
import { CreateBuildingDialog } from "./CreateBuildingDialog";

type BuildingsListProps = {
  buildings: BuildingListItem[];
  canManage: boolean;
};

export function BuildingsList({ buildings, canManage }: BuildingsListProps) {
  return (
    <section className="flex flex-col gap-5" aria-labelledby="buildings-title">
      <DashboardPageHeader
        title={BUILDINGS_CLIENT.LIST_TITLE}
        description={canManage ? BUILDINGS_CLIENT.LIST_DESC : BUILDINGS_CLIENT.LIST_DESC_MEMBER}
        action={canManage ? <CreateBuildingDialog /> : null}
      />

      {buildings.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center border-y border-dashed border-border px-6 py-12 text-center">
          <span className="grid size-11 place-items-center rounded-lg bg-muted text-muted-foreground">
            <Building2Icon className="size-5" aria-hidden="true" />
          </span>
          <h3 className="mt-4 font-heading text-base font-semibold">
            {canManage ? BUILDINGS_CLIENT.EMPTY_TITLE : BUILDINGS_CLIENT.EMPTY_TITLE_MEMBER}
          </h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            {canManage ? BUILDINGS_CLIENT.EMPTY_DESC : BUILDINGS_CLIENT.EMPTY_DESC_MEMBER}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {buildings.map((building) => {
            const href = `${PRIVATE_ROUTES.BUILDINGS}/${building.id}`;
            return (
              <li key={building.id}>
                <Link
                  href={href}
                  className="group grid min-h-20 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-1 py-3 transition-colors hover:bg-muted/30 sm:gap-4 sm:px-3"
                >
                  <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-muted sm:size-12">
                    {building.logoUrl ? (
                      <Image
                        alt={building.name}
                        src={building.logoUrl}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <Building2Icon className="size-5 text-muted-foreground" aria-hidden="true" />
                    )}
                  </span>

                  <span className="min-w-0">
                    <span className="block truncate font-heading text-sm font-semibold sm:text-base">
                      {building.name}
                    </span>
                    <span className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPinIcon className="size-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">
                        {building.address || BUILDINGS_CLIENT.EMPTY_ADDRESS}
                      </span>
                    </span>
                  </span>

                  <span className="flex items-center gap-3">
                    <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                      <Layers3Icon className="size-3.5" aria-hidden="true" />
                      {building.floorCount}{" "}
                      {building.floorCount === 1
                        ? BUILDINGS_CLIENT.FLOOR_SUFFIX
                        : BUILDINGS_CLIENT.FLOORS_SUFFIX}
                    </span>
                    <ArrowRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
