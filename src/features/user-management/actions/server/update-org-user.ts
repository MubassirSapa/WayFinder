"use server";

import { revalidatePath } from "next/cache";

import { PRIVATE_ROUTES } from "@/constants/routes";
import { getCurrentUser } from "@/features/auth/services/server/auth.ports";
import { errorResponse, successResponse } from "@/lib/responses/app-response";

import { USER_MANAGEMENT_CLIENT } from "../../constants/user-management.constants";
import { updateOrgUserBuildings, updateOrgUserInfo, updateOrgUserRole } from "../../services/server/user-management.ports";
import { UpdateOrgUserInfoSchema } from "../../validations/update-org-user-info";

export async function updateOrgUserRoleAction(targetUserId: string, role: "manager" | "member") {
  const currentUser = await getCurrentUser();
  if (!currentUser.isSuccess) return errorResponse([], USER_MANAGEMENT_CLIENT.ERROR_UNAUTHORIZED);

  const result = await updateOrgUserRole(currentUser.data, targetUserId, role);
  if (!result.isSuccess) return errorResponse([], result.message || USER_MANAGEMENT_CLIENT.ERROR_UPDATE_FAILED);

  // A role change also moves the user between the Owner/Managers/Members sections on the list.
  revalidatePath(PRIVATE_ROUTES.USERS);
  revalidatePath(`${PRIVATE_ROUTES.USERS}/${targetUserId}`);
  return successResponse(result.data, USER_MANAGEMENT_CLIENT.SUCCESS_ROLE_UPDATED);
}

export async function updateOrgUserBuildingsAction(targetUserId: string, buildingIds: string[]) {
  const currentUser = await getCurrentUser();
  if (!currentUser.isSuccess) return errorResponse([], USER_MANAGEMENT_CLIENT.ERROR_UNAUTHORIZED);

  const result = await updateOrgUserBuildings(currentUser.data, targetUserId, buildingIds);
  if (!result.isSuccess) return errorResponse([], result.message || USER_MANAGEMENT_CLIENT.ERROR_UPDATE_FAILED);

  revalidatePath(`${PRIVATE_ROUTES.USERS}/${targetUserId}`);
  return successResponse(result.data, USER_MANAGEMENT_CLIENT.SUCCESS_BUILDINGS_UPDATED);
}

export async function updateOrgUserInfoAction(targetUserId: string, formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser.isSuccess) return errorResponse([], USER_MANAGEMENT_CLIENT.ERROR_UNAUTHORIZED);

  const validation = UpdateOrgUserInfoSchema.safeParse({ name: formData.get("name") });
  if (!validation.success) {
    return errorResponse([], validation.error.issues[0]?.message ?? USER_MANAGEMENT_CLIENT.ERROR_UPDATE_FAILED);
  }

  const avatarIdEntry = formData.get("avatarId");
  const avatarId = typeof avatarIdEntry === "string" && avatarIdEntry.length > 0 ? avatarIdEntry : null;

  const result = await updateOrgUserInfo(currentUser.data, targetUserId, {
    ...validation.data,
    avatarId,
    removeAvatar: formData.get("removeAvatar") === "true",
  });
  if (!result.isSuccess) return errorResponse([], result.message || USER_MANAGEMENT_CLIENT.ERROR_UPDATE_FAILED);

  revalidatePath(PRIVATE_ROUTES.USERS);
  revalidatePath(`${PRIVATE_ROUTES.USERS}/${targetUserId}`);
  return successResponse(result.data, USER_MANAGEMENT_CLIENT.SUCCESS_INFO_UPDATED);
}
