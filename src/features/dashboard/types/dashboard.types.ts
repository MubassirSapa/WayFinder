import type { BuildingListItem } from "@/features/buildings/types/buildings.types";

export type DashboardUser = {
  name: string;
  email: string;
  initial: string;
  role: "owner" | "manager" | "member";
};

export type TopbarUser = DashboardUser & {
  avatarUrl: string | null;
};

export type DashboardOrganization = {
  id: string | null;
  name: string;
  initials: string;
  typeLabel: string;
  logoUrl: string | null;
};

export type DashboardFloorOverview = {
  id: string;
  buildingId: string;
  buildingName: string;
  name: string;
  level: number;
  levelLabel: string;
  backgroundImageUrl: string | null;
  status: "draft" | "published";
  updatedLabel: string;
  roomCount: number;
  poiCount: number;
  mapObjectCount: number;
};

export type DashboardData = {
  user: DashboardUser;
  organization: DashboardOrganization;
  buildings: BuildingListItem[];
  floors: DashboardFloorOverview[];
  canManage: boolean;
};
