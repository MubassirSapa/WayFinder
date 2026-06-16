"use server";

import { RESET_PASSWORD_CLIENT } from "@/constants/auth/reset-password";
import { errorResponse, successResponse } from "@/lib/responses/app-response";
import { resetPassword } from "@/services/auth/auth.ports";
import { ResetPasswordSchema, type TResetPasswordSchema } from "@/validations/auth/reset-password";
import { TokenSchema } from "@/validations/auth/token";

export async function resetPasswordAction(data: TResetPasswordSchema, token: string) {
  const tokenValidation = TokenSchema.safeParse({ token });
  if (!tokenValidation.success) return errorResponse([], RESET_PASSWORD_CLIENT.VALIDATION_TOKEN_ERROR);

  const passwordValidation = ResetPasswordSchema.safeParse(data);
  if (!passwordValidation.success) {
    return errorResponse([], RESET_PASSWORD_CLIENT.FALLBACK_SERVER_ERROR);
  }

  const res = await resetPassword(tokenValidation.data.token, passwordValidation.data.password);
  if (!res.isSuccess) return errorResponse([], RESET_PASSWORD_CLIENT.FALLBACK_SERVER_ERROR);

  return successResponse(null, RESET_PASSWORD_CLIENT.SUCCESS_DESC);
}
