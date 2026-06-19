import { z } from "zod";

import { FORGOT_PASSWORD_CLIENT } from "@/features/auth/constants/forgot-password";
import Fields from "@/validations/shared";

export const ForgotPasswordSchema = z.object({
  email: Fields.email(FORGOT_PASSWORD_CLIENT.VALIDATION_EMAIL_ERROR),
});

export type TForgotPasswordSchema = z.infer<typeof ForgotPasswordSchema>;
