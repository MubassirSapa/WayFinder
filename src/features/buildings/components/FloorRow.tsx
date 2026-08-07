"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { PencilIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { PRIVATE_ROUTES } from "@/constants/routes";

import { buildEditorHref, BUILDINGS_CLIENT } from "../constants/buildings.constants";
import { toggleFloorStatusAction } from "../actions/server/toggle-floor-status";
import type { DashboardFloor } from "../types/buildings.types";
import { FloorMiniMap } from "./FloorMiniMap";

type FloorRowProps = {
  floor: DashboardFloor;
  buildingId: string;
};

export function FloorRow({ floor, buildingId }: FloorRowProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [published, setPublished] = useState(floor.isPublished);

  const onToggle = (next: boolean) => {
    setPublished(next);
    startTransition(async () => {
      const result = await toggleFloorStatusAction(floor.id, next);
      if (!result?.isSuccess) {
        setPublished(!next);
        return;
      }
      router.refresh();
    });
  };

  return (
    <li className="px-1 py-4 transition-colors hover:bg-muted/30 sm:px-3">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="flex min-w-0 items-center gap-4">
          <FloorMiniMap className="hidden sm:block" />
          <span className="grid size-10 shrink-0 place-content-center rounded-lg bg-primary/10 font-heading text-xs font-semibold text-primary">
            {floor.badge}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-heading text-base font-semibold text-card-foreground">
              {floor.name}
            </h3>
            <FloorMeta floor={floor} />
          </div>
        </div>

        <div className="grid gap-3 border-t border-border pt-3 sm:grid-cols-[1fr_auto] sm:items-center lg:flex lg:border-t-0 lg:pt-0">
          <span className="text-xs text-muted-foreground sm:text-right">
            {BUILDINGS_CLIENT.UPDATED_PREFIX} {floor.updatedLabel}
          </span>

          <label className="flex shrink-0 items-center justify-between gap-3 sm:justify-start">
            <span
              className={cn(
                "w-20 text-left font-mono text-[0.68rem] font-medium uppercase tracking-[0.16em] sm:text-right",
                published ? "text-primary" : "text-chart-4",
              )}
            >
              {published ? BUILDINGS_CLIENT.STATUS_PUBLISHED : BUILDINGS_CLIENT.STATUS_DRAFT}
            </span>
            <Switch
              checked={published}
              onCheckedChange={onToggle}
              disabled={isPending}
              aria-label={`${floor.name} visibility`}
            />
          </label>

          <div className="col-span-full grid grid-cols-2 gap-2 sm:col-span-2 lg:flex lg:shrink-0">
            <Button
              nativeButton={false}
              render={<Link href={`${PRIVATE_ROUTES.BUILDINGS}/${buildingId}/floors/${floor.id}`} />}
              variant="outline"
              size="sm"
              className="h-11 w-full px-4 sm:w-auto"
            >
              <PencilIcon />
              {BUILDINGS_CLIENT.FLOOR_EDIT_INFO}
            </Button>
            <Button
              nativeButton={false}
              render={<Link href={buildEditorHref(floor.id)} />}
              variant="default"
              size="sm"
              className="h-11 w-full px-4 sm:w-auto"
            >
              {BUILDINGS_CLIENT.FLOOR_OPEN_EDITOR}
            </Button>
          </div>
        </div>
      </div>
    </li>
  );
}

function FloorMeta({ floor }: { floor: DashboardFloor }) {
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
      <span>{floor.levelLabel}</span>
      <Separator />
      <span>
        {floor.roomCount} {BUILDINGS_CLIENT.ROOMS_SUFFIX}
      </span>
      <Separator />
      <span>
        {floor.poiCount} {BUILDINGS_CLIENT.POIS_SUFFIX}
      </span>
    </div>
  );
}

function Separator() {
  return <span className="size-1 rounded-full bg-border" aria-hidden="true" />;
}
