"use server";

import { errorResponse } from "@/lib/responses/app-response";
import { verifyEmail } from "@/features/auth/services/server/auth.ports";
import { sendOwnerWelcomeEmail } from "@/features/email/services/email.ports";
import { VERIFY_EMAIL_CLIENT } from "@/features/auth/constants/verify-email";
import Fields from "@/validations/shared";

export async function verifyEmailAction(token: string, userId?: string) {
  const validation = Fields.token().safeParse(token);
  if (!validation.success) return errorResponse([], VERIFY_EMAIL_CLIENT.ERROR_DESC);

  const res = await verifyEmail(validation.data);
  if (!res.isSuccess) return errorResponse([], VERIFY_EMAIL_CLIENT.ERROR_DESC);

  if (userId) {
    await sendOwnerWelcomeEmail(userId);
  }

  return res;
}
