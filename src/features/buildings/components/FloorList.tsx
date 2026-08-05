import { EyeOffIcon } from "lucide-react";

import { BUILDINGS_CLIENT } from "../constants/buildings.constants";
import type { DashboardFloor } from "../types/buildings.types";
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
    <section className="flex flex-1 flex-col" aria-labelledby="floors-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="floors-title" className="font-heading text-xl font-semibold tracking-tight">
            {BUILDINGS_CLIENT.FLOORS_TITLE}
          </h2>
          <p className="mt-2 inline-flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <EyeOffIcon className="size-4 text-muted-foreground" aria-hidden />
            <span>{BUILDINGS_CLIENT.FLOORS_SUBTITLE_PREFIX}</span>
            <span className="text-chart-4">{BUILDINGS_CLIENT.FLOORS_SUBTITLE_STATUS}</span>
            <span>{BUILDINGS_CLIENT.FLOORS_SUBTITLE_SUFFIX}</span>
          </p>
        </div>
        <AddFloorControl
          buildingId={buildingId}
          organizationName={organizationName}
          className="w-full sm:w-auto"
        />
      </div>

      {floors.length > 0 ? (
        <ul className="mt-5 divide-y divide-border border-y border-border">
          {floors.map((floor) => (
            <FloorRow key={floor.id} floor={floor} buildingId={buildingId} />
          ))}
        </ul>
      ) : (
        <EmptyFloorsState />
      )}
    </section>
  );
}
