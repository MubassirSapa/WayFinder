export type InvitationRole = "manager" | "member";

export type TInviteUserInput = {
  name: string;
  email: string;
  role: InvitationRole;
  buildingIds: string[];
};

export type TAcceptInvitationInput = {
  name: string;
  password: string;
};

export type PendingInvitationListItem = {
  id: string;
  name: string;
  email: string;
  role: InvitationRole;
  invitedByName: string;
  expiresAt: string;
  isExpired: boolean;
};

export type InvitationPreview = {
  email: string;
  name: string;
  role: InvitationRole;
  organizationName: string;
};

/** Invited-by/accepted-at metadata resolved for a user's detail page, if they joined via an invite. */
export type UserInviteHistory = {
  invitedByName: string;
  invitedAt: string;
  acceptedAt: string | null;
};
