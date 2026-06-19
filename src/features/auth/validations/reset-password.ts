import { z } from "zod";

import { RESET_PASSWORD_CLIENT } from "@/features/auth/constants/reset-password";
import Fields from "@/validations/shared";

export const ResetPasswordSchema = z
  .object({
    password: Fields.password({
      min: RESET_PASSWORD_CLIENT.VALIDATION_PASSWORD_MIN,
      strength: RESET_PASSWORD_CLIENT.VALIDATION_PASSWORD_STRENGTH,
    }),
    confirmPassword: Fields.required(RESET_PASSWORD_CLIENT.VALIDATION_CONFIRM_REQUIRED),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: RESET_PASSWORD_CLIENT.VALIDATION_CONFIRM_MISMATCH,
    path: ["confirmPassword"],
  });

export type TResetPasswordSchema = z.infer<typeof ResetPasswordSchema>;
