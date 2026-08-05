export type BuildingListItem = {
  id: string;
  name: string;
  address: string | null;
  floorCount: number;
  logoUrl: string | null;
};

export type BuildingEditData = {
  id: string;
  name: string;
  organizationName: string;
  address: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  website: string | null;
  logoId: string | null;
  logoUrl: string | null;
  floorCount: number;
  canEdit: boolean;
};

export type TCreateBuildingInput = {
  name: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
};

export type TUpdateBuildingInput = TCreateBuildingInput & {
  logoId: string | null;
  removeLogo: boolean;
};

export type FloorStatus = "draft" | "published";

/** The rich floor-list view model shown on a building's page (badges, room/POI counts, publish toggle). */
export type DashboardFloor = {
  id: string;
  name: string;
  level: number;
  levelLabel: string;
  badge: string;
  roomCount: number;
  poiCount: number;
  status: FloorStatus;
  isPublished: boolean;
  updatedLabel: string;
};

export type FloorEditData = {
  id: string;
  buildingId: string;
  buildingName: string;
  name: string;
  level: number;
  width: number;
  height: number;
  metersPerPixel: number | null;
  status: FloorStatus;
};

export type TUpdateFloorMetadataInput = {
  name: string;
  level: number;
  width: number;
  height: number;
  metersPerPixel?: number;
  status: FloorStatus;
};
