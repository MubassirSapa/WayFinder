import { z } from "zod";

import Fields from "@/validations/shared";

import { USER_MANAGEMENT_CLIENT } from "../constants/user-management.constants";

// Self-service only: the account owner proving they know the current
// password before it's replaced. No admin-set variant - see
// ChangePasswordDialog.tsx for why.
export const ChangeOwnPasswordSchema = z
  .object({
    currentPassword: Fields.required(USER_MANAGEMENT_CLIENT.VALIDATION_CURRENT_PASSWORD_REQUIRED),
    newPassword: Fields.password({
      min: USER_MANAGEMENT_CLIENT.VALIDATION_PASSWORD_MIN,
      strength: USER_MANAGEMENT_CLIENT.VALIDATION_PASSWORD_STRENGTH,
    }),
    confirmNewPassword: Fields.required(USER_MANAGEMENT_CLIENT.VALIDATION_CONFIRM_REQUIRED),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: USER_MANAGEMENT_CLIENT.VALIDATION_CONFIRM_MISMATCH,
    path: ["confirmNewPassword"],
  });

export type TChangeOwnPasswordSchema = z.infer<typeof ChangeOwnPasswordSchema>;
