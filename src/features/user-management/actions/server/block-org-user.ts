"use server";

import { revalidatePath } from "next/cache";

import { PRIVATE_ROUTES } from "@/constants/routes";
import { getCurrentUser } from "@/features/auth/services/server/auth.ports";
import { errorResponse, successResponse } from "@/lib/responses/app-response";

import { USER_MANAGEMENT_CLIENT } from "../../constants/user-management.constants";
import { blockOrgUser, unblockOrgUser } from "../../services/server/user-management.ports";

export async function blockOrgUserAction(targetUserId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser.isSuccess) return errorResponse([], USER_MANAGEMENT_CLIENT.ERROR_UNAUTHORIZED);

  const result = await blockOrgUser(currentUser.data, targetUserId);
  if (!result.isSuccess) return errorResponse([], result.message || USER_MANAGEMENT_CLIENT.ERROR_UPDATE_FAILED);

  revalidatePath(`${PRIVATE_ROUTES.USERS}/${targetUserId}`);
  return successResponse(result.data, USER_MANAGEMENT_CLIENT.SUCCESS_BLOCKED);
}

export async function unblockOrgUserAction(targetUserId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser.isSuccess) return errorResponse([], USER_MANAGEMENT_CLIENT.ERROR_UNAUTHORIZED);

  const result = await unblockOrgUser(currentUser.data, targetUserId);
  if (!result.isSuccess) return errorResponse([], result.message || USER_MANAGEMENT_CLIENT.ERROR_UPDATE_FAILED);

  revalidatePath(`${PRIVATE_ROUTES.USERS}/${targetUserId}`);
  return successResponse(result.data, USER_MANAGEMENT_CLIENT.SUCCESS_UNBLOCKED);
}
