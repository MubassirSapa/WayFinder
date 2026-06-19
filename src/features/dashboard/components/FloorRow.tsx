"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import { buildEditorHref, DASHBOARD_CLIENT } from "../constants/dashboard.constants";
import { toggleFloorStatusAction } from "../server-actions/toggle-floor-status";
import type { DashboardFloor } from "../types/dashboard.types";
import { FloorMiniMap } from "./FloorMiniMap";

export function FloorRow({ floor }: { floor: DashboardFloor }) {
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
    <li className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/40">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="flex min-w-0 items-center gap-4">
          <FloorMiniMap className="hidden sm:block" />
          <span className="grid size-12 shrink-0 place-content-center rounded-xl border border-primary/30 bg-primary/10 font-heading text-sm font-semibold text-primary">
            {floor.badge}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-heading text-base font-semibold text-card-foreground">
              {floor.name}
            </h3>
            <FloorMeta floor={floor} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-center lg:flex lg:justify-end">
          <span className="text-xs text-muted-foreground sm:text-right">
            {DASHBOARD_CLIENT.UPDATED_PREFIX} {floor.updatedLabel}
          </span>

          <label className="flex shrink-0 items-center justify-between gap-3 sm:justify-start">
            <span
              className={cn(
                "w-20 text-left font-mono text-[0.68rem] font-medium uppercase tracking-[0.16em] sm:text-right",
                published ? "text-primary" : "text-chart-4",
              )}
            >
              {published ? DASHBOARD_CLIENT.STATUS_PUBLISHED : DASHBOARD_CLIENT.STATUS_DRAFT}
            </span>
            <Switch
              checked={published}
              onCheckedChange={onToggle}
              disabled={isPending}
              aria-label={`${floor.name} visibility`}
            />
          </label>

          <Button
            nativeButton={false}
            render={<Link href={buildEditorHref(floor.id)} />}
            variant="outline"
            size="lg"
            className="h-10 w-full shrink-0 sm:w-auto"
          >
            {DASHBOARD_CLIENT.OPEN_EDITOR}
          </Button>
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
        {floor.roomCount} {DASHBOARD_CLIENT.ROOMS_SUFFIX}
      </span>
      <Separator />
      <span>
        {floor.poiCount} {DASHBOARD_CLIENT.POIS_SUFFIX}
      </span>
    </div>
  );
}

function Separator() {
  return <span className="size-1 rounded-full bg-border" aria-hidden="true" />;
}
