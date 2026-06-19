import { EyeOffIcon } from "lucide-react";

import { DASHBOARD_CLIENT } from "../constants/dashboard.constants";
import type { DashboardFloor } from "../types/dashboard.types";
import { AddFloorControl } from "./AddFloorControl";
import { EmptyFloorsState } from "./EmptyFloorsState";
import { FloorRow } from "./FloorRow";

type FloorListProps = {
  floors: DashboardFloor[];
  buildingId: string;
  organizationName: string;
};

export function FloorList({ floors, buildingId, organizationName }: FloorListProps) {
  return (
    <section className="flex flex-1 flex-col">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            {DASHBOARD_CLIENT.FLOORS_TITLE}
          </h2>
          <p className="mt-2 inline-flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <EyeOffIcon className="size-4 text-muted-foreground" aria-hidden />
            <span>{DASHBOARD_CLIENT.FLOORS_SUBTITLE_PREFIX}</span>
            <span className="text-chart-4">{DASHBOARD_CLIENT.FLOORS_SUBTITLE_STATUS}</span>
            <span>{DASHBOARD_CLIENT.FLOORS_SUBTITLE_SUFFIX}</span>
          </p>
        </div>
        <AddFloorControl
          buildingId={buildingId}
          organizationName={organizationName}
          className="w-full sm:w-auto"
        />
      </div>

      {floors.length > 0 ? (
        <ul className="mt-6 flex flex-col gap-3">
          {floors.map((floor) => (
            <FloorRow key={floor.id} floor={floor} />
          ))}
        </ul>
      ) : (
        <EmptyFloorsState />
      )}
    </section>
  );
}
