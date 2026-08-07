export type ManagedRole = "manager" | "member";
export type OrgRole = "owner" | ManagedRole;

export type OrgUserListItem = {
  id: string;
  name: string;
  email: string;
  role: OrgRole;
  avatarUrl: string | null;
  buildingIds: string[];
  buildingNames: string[];
  isSelf: boolean;
};

export type OrgBuildingOption = {
  id: string;
  name: string;
};

export type OrgUserDetail = OrgUserListItem & {
  blocked: boolean;
  createdAt: string;
  inviteHistory: {
    invitedByName: string;
    invitedAt: string;
    acceptedAt: string | null;
  } | null;
};
