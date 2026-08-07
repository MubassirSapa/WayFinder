"use server";

import { redirect } from "next/navigation";

import { PRIVATE_ROUTES } from "@/constants/routes";
import { TokenSchema } from "@/features/auth/validations/token";
import { errorResponse } from "@/lib/responses/app-response";

import { INVITATIONS_CLIENT } from "../../constants/invitations.constants";
import { acceptInvitation } from "../../services/server/invitation.ports";
import { AcceptInvitationSchema, type TAcceptInvitationSchema } from "../../validations/accept-invitation";

export async function acceptInvitationAction(data: TAcceptInvitationSchema, token: string) {
  const tokenValidation = TokenSchema.safeParse({ token });
  if (!tokenValidation.success) return errorResponse([], INVITATIONS_CLIENT.INVALID_INVITE_DESC);

  const validation = AcceptInvitationSchema.safeParse(data);
  if (!validation.success) {
    return errorResponse([], validation.error.issues[0]?.message ?? INVITATIONS_CLIENT.FALLBACK_SERVER_ERROR);
  }

  const result = await acceptInvitation(tokenValidation.data.token, validation.data);
  if (!result.isSuccess) return errorResponse([], result.message || INVITATIONS_CLIENT.FALLBACK_SERVER_ERROR);

  redirect(PRIVATE_ROUTES.DASHBOARD);
}
