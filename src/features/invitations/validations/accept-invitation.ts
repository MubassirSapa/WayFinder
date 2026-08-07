import { z } from "zod";

import Fields from "@/validations/shared";

import { INVITATIONS_CLIENT } from "../constants/invitations.constants";

export const AcceptInvitationSchema = z
  .object({
    name: Fields.name(),
    password: Fields.password({
      min: INVITATIONS_CLIENT.VALIDATION_PASSWORD_MIN,
      strength: INVITATIONS_CLIENT.VALIDATION_PASSWORD_STRENGTH,
    }),
    confirmPassword: Fields.required(INVITATIONS_CLIENT.VALIDATION_CONFIRM_REQUIRED),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: INVITATIONS_CLIENT.VALIDATION_CONFIRM_MISMATCH,
    path: ["confirmPassword"],
  });

export type TAcceptInvitationSchema = z.infer<typeof AcceptInvitationSchema>;
