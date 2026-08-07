"use server";

import { revalidatePath } from "next/cache";

import { isOwnerOrManager } from "@/collections/constants/roles";
import { PRIVATE_ROUTES } from "@/constants/routes";
import { getCurrentUser } from "@/features/auth/services/server/auth.ports";
import { errorResponse, successResponse } from "@/lib/responses/app-response";

import { INVITATIONS_CLIENT } from "../../constants/invitations.constants";
import { revokeInvitation } from "../../services/server/invitation.ports";

export async function revokeInvitationAction(invitationId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser.isSuccess) return errorResponse([], INVITATIONS_CLIENT.ERROR_UNAUTHORIZED);

  const user = currentUser.data;
  if (!isOwnerOrManager(user.role)) return errorResponse([], INVITATIONS_CLIENT.ERROR_FORBIDDEN);

  const result = await revokeInvitation(user, invitationId);
  if (!result.isSuccess) return errorResponse([], result.message || INVITATIONS_CLIENT.ERROR_REVOKE_FAILED);

  revalidatePath(PRIVATE_ROUTES.USERS);
  return successResponse(result.data, INVITATIONS_CLIENT.SUCCESS_REVOKED);
}
