import type { FloorStatus } from "../../types/buildings.types";

export type TCreateFloor = {
  name: string;
  level: number;
  buildingId: string;
  publish: boolean;
};

export type TSetFloorStatus = {
  id: string;
  status: FloorStatus;
};
