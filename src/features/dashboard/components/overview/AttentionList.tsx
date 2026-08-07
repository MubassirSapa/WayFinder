import Link from "next/link";
import { CheckCircle2Icon, ChevronRightIcon, CircleAlertIcon, FileWarningIcon } from "lucide-react";

import { buildEditorHref } from "@/features/buildings/constants/buildings.constants";

import { DASHBOARD_CLIENT } from "../../constants/dashboard.constants";
import type { DashboardFloorOverview } from "../../types/dashboard.types";
import { DashboardSectionHeader } from "./DashboardSectionHeader";

export function AttentionList({ floors }: { floors: DashboardFloorOverview[] }) {
  const attentionFloors = floors.filter((floor) => floor.status === "draft" || floor.mapObjectCount === 0);

  return (
    <section aria-labelledby="attention-title">
      <DashboardSectionHeader
        id="attention-title"
        title={DASHBOARD_CLIENT.ATTENTION_TITLE}
        description={DASHBOARD_CLIENT.ATTENTION_DESCRIPTION}
      />

      {attentionFloors.length > 0 ? (
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {attentionFloors.slice(0, 6).map((floor) => {
            const isEmpty = floor.mapObjectCount === 0;
            return (
              <li key={floor.id}>
                <Link
                  href={buildEditorHref(floor.id)}
                  className="group flex min-h-18 items-center gap-3 px-1 py-3 transition-colors hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/30 sm:px-3"
                >
                  <span className="grid size-9 shrink-0 place-content-center rounded-md bg-warning/10 text-warning">
                    {isEmpty ? <FileWarningIcon className="size-4" /> : <CircleAlertIcon className="size-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-heading text-sm font-semibold">{floor.name}</span>
                      {floor.status === "draft" ? (
                        <span className="size-2 rounded-full bg-destructive" title={DASHBOARD_CLIENT.DRAFT}>
                          <span className="sr-only">{DASHBOARD_CLIENT.DRAFT}</span>
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block truncate text-xs text-muted-foreground">
                      {floor.buildingName} - {isEmpty ? DASHBOARD_CLIENT.NO_MAP_CONTENT : DASHBOARD_CLIENT.NOT_PUBLIC}
                    </span>
                  </span>
                  <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-4 flex items-start gap-3 border-y border-border px-1 py-5 sm:px-3">
          <span className="grid size-9 shrink-0 place-content-center rounded-md bg-success/10 text-success">
            <CheckCircle2Icon className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-heading text-sm font-semibold">{DASHBOARD_CLIENT.ATTENTION_CLEAR_TITLE}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{DASHBOARD_CLIENT.ATTENTION_CLEAR_DESCRIPTION}</p>
          </div>
        </div>
      )}
    </section>
  );
}
