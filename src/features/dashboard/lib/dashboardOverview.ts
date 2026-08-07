import { relationId } from "@/lib/payload-id";
import type { Floor, MapObject } from "@/payload-types";

import { formatRelativeTime, levelToLabel } from "@/features/buildings/lib/floorPresentation";
import type { BuildingListItem } from "@/features/buildings/types/buildings.types";
import type { DashboardFloorOverview } from "../types/dashboard.types";

type FloorSource = Pick<
  Floor,
  "id" | "building" | "name" | "level" | "backgroundImageUrl" | "status" | "updatedAt"
>;
type MapObjectSource = Pick<MapObject, "floor" | "type">;

export function buildDashboardFloorOverview(
  floors: FloorSource[],
  mapObjects: MapObjectSource[],
  buildings: BuildingListItem[],
  now: number = Date.now(),
): DashboardFloorOverview[] {
  const buildingNames = new Map(buildings.map((building) => [building.id, building.name]));
  const objectCounts = new Map<string, { total: number; rooms: number; pois: number }>();

  for (const object of mapObjects) {
    const floorId = relationId(object.floor);
    if (floorId === null) continue;

    const key = String(floorId);
    const counts = objectCounts.get(key) ?? { total: 0, rooms: 0, pois: 0 };
    counts.total += 1;
    if (object.type === "room") counts.rooms += 1;
    if (object.type === "poi") counts.pois += 1;
    objectCounts.set(key, counts);
  }

  return [...floors]
    .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt))
    .flatMap((floor) => {
      const buildingId = relationId(floor.building);
      if (buildingId === null) return [];

      const id = String(floor.id);
      const buildingIdKey = String(buildingId);
      const counts = objectCounts.get(id) ?? { total: 0, rooms: 0, pois: 0 };

      return [{
        id,
        buildingId: buildingIdKey,
        buildingName: buildingNames.get(buildingIdKey) ?? "Building",
        name: floor.name,
        level: floor.level,
        levelLabel: levelToLabel(floor.level),
        backgroundImageUrl: floor.backgroundImageUrl ?? null,
        status: floor.status,
        updatedLabel: formatRelativeTime(floor.updatedAt, now),
        roomCount: counts.rooms,
        poiCount: counts.pois,
        mapObjectCount: counts.total,
      }];
    });
}
