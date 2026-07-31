export type DashboardFloorStatus = "draft" | "published";

export type DashboardUser = {
  name: string;
  email: string;
  initial: string;
};

export type DashboardOrganization = {
  id: string | null;
  name: string;
  initials: string;
  typeLabel: string;
};

export type DashboardFloor = {
  id: string;
  name: string;
  level: number;
  levelLabel: string;
  badge: string;
  roomCount: number;
  poiCount: number;
  status: DashboardFloorStatus;
  isPublished: boolean;
  updatedLabel: string;
};

export type DashboardData = {
  user: DashboardUser;
  organization: DashboardOrganization;
  floors: DashboardFloor[];
  buildingId: string;
};
