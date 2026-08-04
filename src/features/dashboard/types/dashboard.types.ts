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

export type DashboardData = {
  user: DashboardUser;
  organization: DashboardOrganization;
  buildings: BuildingListItem[];
  canManage: boolean;
};
