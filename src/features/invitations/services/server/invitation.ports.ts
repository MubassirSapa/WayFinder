import type { User } from "@/payload-types";

import {
  acceptInvitationAdapter,
  createInvitationAdapter,
  getInvitationPreviewAdapter,
  getUserInviteHistoryAdapter,
  listPendingInvitationsAdapter,
  resendInvitationAdapter,
  revokeInvitationAdapter,
} from "./invitation-pl.adapter";
import type { TAcceptInvitationInput, TInviteUserInput } from "../../types/invitation.types";

export async function createInvitation(user: User, input: TInviteUserInput) {
  return createInvitationAdapter(user, input);
}

export async function resendInvitation(user: User, invitationId: string) {
  return resendInvitationAdapter(user, invitationId);
}

export async function revokeInvitation(user: User, invitationId: string) {
  return revokeInvitationAdapter(user, invitationId);
}

export async function listPendingInvitations(user: User) {
  return listPendingInvitationsAdapter(user);
}

export async function getInvitationPreview(token: string) {
  return getInvitationPreviewAdapter(token);
}

export async function acceptInvitation(token: string, input: TAcceptInvitationInput) {
  return acceptInvitationAdapter(token, input);
}

export async function getUserInviteHistory(user: User, email: string) {
  return getUserInviteHistoryAdapter(user, email);
}
