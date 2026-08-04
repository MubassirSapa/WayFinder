"use server";

import { revalidatePath } from "next/cache";

import { PRIVATE_ROUTES } from "@/constants/routes";
import { getCurrentUser } from "@/features/auth/services/server/auth.ports";
import { errorResponse, successResponse } from "@/lib/responses/app-response";

import { PROFILE_CLIENT } from "../../constants/profile.constants";
import { updateOrganizationProfile } from "../../services/server/profile.ports";
import {
  UpdateOrganizationProfileSchema,
  type TUpdateOrganizationProfileInput,
} from "../../validations/update-organization-profile";

function getRelationId(relation: unknown) {
  if (relation === null || relation === undefined) return null;
  if (typeof relation === "object" && "id" in relation) {
    const id = (relation as { id: unknown }).id;
    return id === null || id === undefined ? null : String(id);
  }
  return String(relation);
}

export async function updateOrganizationProfileAction(input: TUpdateOrganizationProfileInput) {
  const user = await getCurrentUser();
  if (!user.isSuccess) return errorResponse([], PROFILE_CLIENT.ERROR_UNAUTHORIZED);

  const organizationId = getRelationId(user.data.organization);
  if (!organizationId) return errorResponse([], PROFILE_CLIENT.ERROR_NO_ORGANIZATION);

  const validation = UpdateOrganizationProfileSchema.safeParse(input);
  if (!validation.success) {
    return errorResponse(
      [],
      validation.error.issues[0]?.message ?? PROFILE_CLIENT.ERROR_UPDATE_FAILED,
    );
  }

  const result = await updateOrganizationProfile({
    organizationId,
    ...validation.data,
  });
  if (!result.isSuccess) return errorResponse([], PROFILE_CLIENT.ERROR_UPDATE_FAILED);

  revalidatePath(PRIVATE_ROUTES.PROFILE);
  revalidatePath(PRIVATE_ROUTES.DASHBOARD);
  return successResponse(true, PROFILE_CLIENT.SAVED);
}
