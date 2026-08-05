"use server";

import { revalidatePath } from "next/cache";

import { PRIVATE_ROUTES } from "@/constants/routes";
import { ROLES } from "@/collections/constants/roles";
import { getCurrentUser } from "@/features/auth/services/server/auth.ports";
import { errorResponse, successResponse } from "@/lib/responses/app-response";

import { ORGANIZATION_SETTINGS_CLIENT } from "../../constants/organization-settings.constants";
import { updateOrganization } from "../../services/server/organization-settings.ports";
import { UpdateOrganizationSchema } from "../../validations/update-organization";

export async function updateOrganizationAction(formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser.isSuccess) return errorResponse([], ORGANIZATION_SETTINGS_CLIENT.ERROR_UNAUTHORIZED);

  const user = currentUser.data;
  if (user.role !== ROLES.OWNER && user.role !== ROLES.MANAGER) {
    return errorResponse([], ORGANIZATION_SETTINGS_CLIENT.ERROR_FORBIDDEN);
  }

  const validation = UpdateOrganizationSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
  });
  if (!validation.success) {
    return errorResponse([], validation.error.issues[0]?.message ?? ORGANIZATION_SETTINGS_CLIENT.ERROR_UPDATE_FAILED);
  }

  const logoIdEntry = formData.get("logoId");
  const logoId = typeof logoIdEntry === "string" && logoIdEntry.length > 0 ? logoIdEntry : null;

  const result = await updateOrganization(user, {
    ...validation.data,
    logoId,
    removeLogo: formData.get("removeLogo") === "true",
  });
  if (!result.isSuccess) return errorResponse([], result.message || ORGANIZATION_SETTINGS_CLIENT.ERROR_UPDATE_FAILED);

  revalidatePath(PRIVATE_ROUTES.DASHBOARD);
  return successResponse(result.data, ORGANIZATION_SETTINGS_CLIENT.SUCCESS_UPDATED);
}
