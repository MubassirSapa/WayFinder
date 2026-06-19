import { sendOwnerWelcomeEmailAdapter } from "./email-pl.adapter";

export async function sendOwnerWelcomeEmail(userId: string) {
  return sendOwnerWelcomeEmailAdapter(userId);
}
