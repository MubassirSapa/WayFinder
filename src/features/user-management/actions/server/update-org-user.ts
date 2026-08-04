"use server";

import { revalidatePath } from "next/cache";

import { PRIVATE_ROUTES } from "@/constants/routes";
import { getCurrentUser } from "@/features/auth/services/server/auth.ports";
import { errorResponse, successResponse } from "@/lib/responses/app-response";

import { USER_MANAGEMENT_CLIENT } from "../../constants/user-management.constants";
import { updateOrgUserBuildings, updateOrgUserRole } from "../../services/server/user-management.ports";

export async function updateOrgUserRoleAction(targetUserId: string, role: "manager" | "member") {
  const currentUser = await getCurrentUser();
  if (!currentUser.isSuccess) return errorResponse([], USER_MANAGEMENT_CLIENT.ERROR_UNAUTHORIZED);

  const result = await updateOrgUserRole(currentUser.data, targetUserId, role);
  if (!result.isSuccess) return errorResponse([], result.message || USER_MANAGEMENT_CLIENT.ERROR_UPDATE_FAILED);

  revalidatePath(PRIVATE_ROUTES.USERS);
  return successResponse(result.data, USER_MANAGEMENT_CLIENT.SUCCESS_ROLE_UPDATED);
}

export async function updateOrgUserBuildingsAction(targetUserId: string, buildingIds: string[]) {
  const currentUser = await getCurrentUser();
  if (!currentUser.isSuccess) return errorResponse([], USER_MANAGEMENT_CLIENT.ERROR_UNAUTHORIZED);

  const result = await updateOrgUserBuildings(currentUser.data, targetUserId, buildingIds);
  if (!result.isSuccess) return errorResponse([], result.message || USER_MANAGEMENT_CLIENT.ERROR_UPDATE_FAILED);

  revalidatePath(PRIVATE_ROUTES.USERS);
  return successResponse(result.data, USER_MANAGEMENT_CLIENT.SUCCESS_BUILDINGS_UPDATED);
}
