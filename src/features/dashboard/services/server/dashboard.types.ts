import type { DashboardFloorStatus } from "../../types/dashboard.types";

export type TCreateFloor = {
  name: string;
  level: number;
  buildingId: string;
  publish: boolean;
};

export type TSetFloorStatus = {
  id: string;
  status: DashboardFloorStatus;
};
