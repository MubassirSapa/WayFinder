"use server";

import { FORGOT_PASSWORD_CLIENT } from "@/features/auth/constants/forgot-password";
import { errorResponse, successResponse } from "@/lib/responses/app-response";
import { forgotPassword } from "@/features/auth/services/server/auth.ports";
import {
  ForgotPasswordSchema,
  type TForgotPasswordSchema,
} from "@/features/auth/validations/forgot-password";

export async function forgotPasswordAction(data: TForgotPasswordSchema) {
  const validation = ForgotPasswordSchema.safeParse(data);
  if (!validation.success) return errorResponse([], FORGOT_PASSWORD_CLIENT.FALLBACK_SERVER_ERROR);

  await forgotPassword(validation.data.email);

  return successResponse(null, FORGOT_PASSWORD_CLIENT.SUCCESS_DESC);
}
