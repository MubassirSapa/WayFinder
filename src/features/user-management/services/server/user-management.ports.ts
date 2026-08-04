import type { User } from "@/payload-types";
import { listBuildings } from "@/features/buildings/services/server/buildings.ports";

import {
  createOrgUserAdapter,
  deleteOrgUserAdapter,
  listOrgUsersAdapter,
  updateOrgUserBuildingsAdapter,
  updateOrgUserRoleAdapter,
} from "./user-management-pl.adapter";
import type { OrgBuildingOption, TCreateOrgUserInput } from "../../types/user-management.types";

export async function listOrgUsers(user: User) {
  return listOrgUsersAdapter(user);
}

export async function listOrgBuildingOptions(user: User): Promise<OrgBuildingOption[]> {
  const result = await listBuildings(user);
  if (!result.isSuccess) return [];

  return result.data.map((building) => ({ id: building.id, name: building.name }));
}

export async function createOrgUser(user: User, input: TCreateOrgUserInput) {
  return createOrgUserAdapter(user, input);
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
