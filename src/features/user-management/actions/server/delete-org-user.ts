"use server";

import { revalidatePath } from "next/cache";

import { PRIVATE_ROUTES } from "@/constants/routes";
import { getCurrentUser } from "@/features/auth/services/server/auth.ports";
import { errorResponse, successResponse } from "@/lib/responses/app-response";

import { USER_MANAGEMENT_CLIENT } from "../../constants/user-management.constants";
import { deleteOrgUser } from "../../services/server/user-management.ports";

export async function deleteOrgUserAction(targetUserId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser.isSuccess) return errorResponse([], USER_MANAGEMENT_CLIENT.ERROR_UNAUTHORIZED);

  const result = await deleteOrgUser(currentUser.data, targetUserId);
  if (!result.isSuccess) return errorResponse([], result.message || USER_MANAGEMENT_CLIENT.ERROR_REMOVE_FAILED);

  revalidatePath(PRIVATE_ROUTES.USERS);
  return successResponse(result.data, USER_MANAGEMENT_CLIENT.SUCCESS_REMOVED);
}
