import { createFloorAdapter, setFloorStatusAdapter } from "./dashboard-pl.adapter";
import type { TCreateFloor, TSetFloorStatus } from "./dashboard.types";

export async function createFloor(data: TCreateFloor) {
  return createFloorAdapter(data);
}

export async function setFloorStatus(data: TSetFloorStatus) {
  return setFloorStatusAdapter(data);
}
