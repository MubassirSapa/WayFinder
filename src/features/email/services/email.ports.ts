import { sendInviteEmailAdapter, sendOwnerWelcomeEmailAdapter, type SendInviteEmailParams } from "./email-pl.adapter";

export async function sendOwnerWelcomeEmail(userId: string) {
  return sendOwnerWelcomeEmailAdapter(userId);
}

export async function sendInviteEmail(params: SendInviteEmailParams) {
  return sendInviteEmailAdapter(params);
}
