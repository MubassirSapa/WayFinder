"use server";

import { changeOwnPassword, getCurrentUser } from "@/features/auth/services/server/auth.ports";
import { errorResponse, successResponse } from "@/lib/responses/app-response";

import { USER_MANAGEMENT_CLIENT } from "../../constants/user-management.constants";
import { ChangeOwnPasswordSchema } from "../../validations/change-password";

// Self-service only - no targetUserId parameter at all, always the caller's
// own account (see auth-pl.adapter.ts's changeOwnPasswordAdapter comment
// for why that's a structural guarantee, not just convention). An admin-set
// variant (owner/manager setting another user's password directly, no
// current-password proof) was deliberately not built - a silent account-
// takeover vector with no notification or re-auth step.
export async function changeOwnPasswordAction(currentPassword: string, newPassword: string, confirmNewPassword: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser.isSuccess) return errorResponse([], USER_MANAGEMENT_CLIENT.ERROR_UNAUTHORIZED);

  const validation = ChangeOwnPasswordSchema.safeParse({ currentPassword, newPassword, confirmNewPassword });
  if (!validation.success) {
    return errorResponse([], validation.error.issues[0]?.message ?? USER_MANAGEMENT_CLIENT.ERROR_UPDATE_FAILED);
  }

  const result = await changeOwnPassword(currentUser.data, validation.data.currentPassword, validation.data.newPassword);
  if (!result.isSuccess) return errorResponse([], result.message || USER_MANAGEMENT_CLIENT.ERROR_UPDATE_FAILED);

  return successResponse(null, USER_MANAGEMENT_CLIENT.SUCCESS_PASSWORD_CHANGED);
}
