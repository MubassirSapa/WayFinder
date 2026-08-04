import Image from "next/image";
import Link from "next/link";
import { Building2Icon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PRIVATE_ROUTES } from "@/constants/routes";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";

import { BUILDINGS_CLIENT } from "../constants/buildings.constants";
import { CreateBuildingDialog } from "./CreateBuildingDialog";
import type { BuildingListItem } from "../types/buildings.types";

type BuildingsListProps = {
  buildings: BuildingListItem[];
  canManage: boolean;
};

export function BuildingsList({ buildings, canManage }: BuildingsListProps) {
  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title={BUILDINGS_CLIENT.LIST_TITLE}
        description={canManage ? BUILDINGS_CLIENT.LIST_DESC : BUILDINGS_CLIENT.LIST_DESC_MEMBER}
        action={canManage ? <CreateBuildingDialog /> : null}
      />

      {buildings.length === 0 ? (
        <Card className="items-center px-6 py-14 text-center">
          <Building2Icon className="size-8 text-muted-foreground" />
          <h3 className="mt-2 font-heading text-base font-semibold">
            {canManage ? BUILDINGS_CLIENT.EMPTY_TITLE : BUILDINGS_CLIENT.EMPTY_TITLE_MEMBER}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {canManage ? BUILDINGS_CLIENT.EMPTY_DESC : BUILDINGS_CLIENT.EMPTY_DESC_MEMBER}
          </p>
        </Card>
      ) : (
        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{BUILDINGS_CLIENT.COLUMN_NAME}</TableHead>
                <TableHead>{BUILDINGS_CLIENT.COLUMN_ADDRESS}</TableHead>
                <TableHead className="text-end">{BUILDINGS_CLIENT.COLUMN_FLOORS}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buildings.map((building) => (
                <TableRow key={building.id} className="cursor-pointer">
                  <TableCell className="font-medium">
                    <Link href={`${PRIVATE_ROUTES.BUILDINGS}/${building.id}`} className="flex items-center gap-3">
                      <span className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                        {building.logoUrl ? (
                          <Image alt={building.name} src={building.logoUrl} fill sizes="32px" className="object-cover" />
                        ) : (
                          <Building2Icon className="size-4 text-muted-foreground" />
                        )}
                      </span>
                      {building.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <Link href={`${PRIVATE_ROUTES.BUILDINGS}/${building.id}`} className="block">
                      {building.address || BUILDINGS_CLIENT.EMPTY_ADDRESS}
                    </Link>
                  </TableCell>
                  <TableCell className="text-end">
                    <Link href={`${PRIVATE_ROUTES.BUILDINGS}/${building.id}`} className="block">
                      {building.floorCount}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
