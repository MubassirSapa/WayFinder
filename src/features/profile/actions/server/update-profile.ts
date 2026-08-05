"use server";

import { revalidatePath } from "next/cache";

import { PRIVATE_ROUTES } from "@/constants/routes";
import { getCurrentUser } from "@/features/auth/services/server/auth.ports";
import { errorResponse, successResponse } from "@/lib/responses/app-response";

import { PROFILE_CLIENT } from "../../constants/profile.constants";
import { updateProfile } from "../../services/server/profile.ports";
import { UpdateProfileSchema } from "../../validations/update-profile";

export async function updateProfileAction(formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser.isSuccess) return errorResponse([], PROFILE_CLIENT.ERROR_UNAUTHORIZED);

  const validation = UpdateProfileSchema.safeParse({
    name: formData.get("name"),
  });
  if (!validation.success) {
    return errorResponse([], validation.error.issues[0]?.message ?? PROFILE_CLIENT.ERROR_UPDATE_FAILED);
  }

  const avatarIdEntry = formData.get("avatarId");
  const avatarId = typeof avatarIdEntry === "string" && avatarIdEntry.length > 0 ? avatarIdEntry : null;

  const result = await updateProfile(currentUser.data, {
    ...validation.data,
    avatarId,
    removeAvatar: formData.get("removeAvatar") === "true",
  });
  if (!result.isSuccess) return errorResponse([], result.message || PROFILE_CLIENT.ERROR_UPDATE_FAILED);

  revalidatePath(PRIVATE_ROUTES.DASHBOARD);
  return successResponse(result.data, PROFILE_CLIENT.SUCCESS_UPDATED);
}
