import { sendInviteEmailAdapter, type SendInviteEmailParams } from "./email-pl.adapter";

export async function sendInviteEmail(params: SendInviteEmailParams) {
  return sendInviteEmailAdapter(params);
}
