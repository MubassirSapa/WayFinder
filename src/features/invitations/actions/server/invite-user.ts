"use server";

import { revalidatePath } from "next/cache";

import { isOwnerOrManager } from "@/collections/constants/roles";
import { PRIVATE_ROUTES } from "@/constants/routes";
import { getCurrentUser } from "@/features/auth/services/server/auth.ports";
import { errorResponse, successResponse } from "@/lib/responses/app-response";

import { INVITATIONS_CLIENT } from "../../constants/invitations.constants";
import { createInvitation } from "../../services/server/invitation.ports";
import { InviteUserSchema } from "../../validations/invite-user";

export async function inviteUserAction(formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser.isSuccess) return errorResponse([], INVITATIONS_CLIENT.ERROR_UNAUTHORIZED);

  const user = currentUser.data;
  if (!isOwnerOrManager(user.role)) return errorResponse([], INVITATIONS_CLIENT.ERROR_FORBIDDEN);

  const validation = InviteUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    buildingIds: formData.getAll("buildingIds"),
  });
  if (!validation.success) {
    return errorResponse([], validation.error.issues[0]?.message ?? INVITATIONS_CLIENT.ERROR_INVITE_FAILED);
  }

  const result = await createInvitation(user, validation.data);
  if (!result.isSuccess) return errorResponse([], result.message || INVITATIONS_CLIENT.ERROR_INVITE_FAILED);

  revalidatePath(PRIVATE_ROUTES.USERS);
  return successResponse(result.data, INVITATIONS_CLIENT.SUCCESS_INVITED);
}
