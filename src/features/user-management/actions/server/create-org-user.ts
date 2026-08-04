"use server";

import { revalidatePath } from "next/cache";

import { ROLES } from "@/collections/constants/roles";
import { PRIVATE_ROUTES } from "@/constants/routes";
import { getCurrentUser } from "@/features/auth/services/server/auth.ports";
import { errorResponse, successResponse } from "@/lib/responses/app-response";

import { USER_MANAGEMENT_CLIENT } from "../../constants/user-management.constants";
import { createOrgUser } from "../../services/server/user-management.ports";
import { CreateOrgUserSchema } from "../../validations/create-org-user";

export async function createOrgUserAction(formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser.isSuccess) return errorResponse([], USER_MANAGEMENT_CLIENT.ERROR_UNAUTHORIZED);

  const user = currentUser.data;
  if (user.role !== ROLES.OWNER && user.role !== ROLES.MANAGER) {
    return errorResponse([], USER_MANAGEMENT_CLIENT.ERROR_FORBIDDEN);
  }

  const validation = CreateOrgUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    buildingIds: formData.getAll("buildingIds"),
  });
  if (!validation.success) {
    return errorResponse([], validation.error.issues[0]?.message ?? USER_MANAGEMENT_CLIENT.ERROR_CREATE_FAILED);
  }

  const result = await createOrgUser(user, validation.data);
  if (!result.isSuccess) return errorResponse([], result.message || USER_MANAGEMENT_CLIENT.ERROR_CREATE_FAILED);

  revalidatePath(PRIVATE_ROUTES.USERS);
  return successResponse(result.data, USER_MANAGEMENT_CLIENT.SUCCESS_CREATED);
}
