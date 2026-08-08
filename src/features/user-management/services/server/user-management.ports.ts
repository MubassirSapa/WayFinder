import type { User } from "@/payload-types";
import { listBuildings } from "@/features/buildings/services/server/buildings.ports";
import { getUserInviteHistory } from "@/features/invitations/services/server/invitation.ports";

import {
  blockOrgUserAdapter,
  deleteOrgUserAdapter,
  getOrgUserDetailBaseAdapter,
  listOrgUsersAdapter,
  unblockOrgUserAdapter,
  updateOrgUserBuildingsAdapter,
  updateOrgUserInfoAdapter,
  updateOrgUserRoleAdapter,
} from "./user-management-pl.adapter";
import type { OrgBuildingOption, OrgUserDetail } from "../../types/user-management.types";

export async function listOrgUsers(user: User) {
  return listOrgUsersAdapter(user);
}

export async function listOrgBuildingOptions(user: User): Promise<OrgBuildingOption[]> {
  const result = await listBuildings(user);
  if (!result.isSuccess) return [];

  return result.data.map((building) => ({ id: building.id, name: building.name }));
}

export async function getOrgUserDetail(user: User, targetUserId: string) {
  const result = await getOrgUserDetailBaseAdapter(user, targetUserId);
  if (!result.isSuccess) return result;

  const inviteHistory = await getUserInviteHistory(user, result.data.email);

  return { ...result, data: { ...result.data, inviteHistory } satisfies OrgUserDetail };
}

export async function blockOrgUser(user: User, targetUserId: string) {
  return blockOrgUserAdapter(user, targetUserId);
}

export async function unblockOrgUser(user: User, targetUserId: string) {
  return unblockOrgUserAdapter(user, targetUserId);
}

export async function updateOrgUserRole(user: User, targetUserId: string, role: "manager" | "member") {
  return updateOrgUserRoleAdapter(user, targetUserId, role);
}

export async function updateOrgUserBuildings(user: User, targetUserId: string, buildingIds: string[]) {
  return updateOrgUserBuildingsAdapter(user, targetUserId, buildingIds);
}

export async function deleteOrgUser(user: User, targetUserId: string) {
  return deleteOrgUserAdapter(user, targetUserId);
}

export async function updateOrgUserInfo(
  user: User,
  targetUserId: string,
  input: { name: string; avatarId?: string | null; removeAvatar?: boolean },
) {
  return updateOrgUserInfoAdapter(user, targetUserId, input);
}
