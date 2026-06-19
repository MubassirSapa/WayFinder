import { z } from "zod";

import { SIGNIN_CLIENT } from "@/features/auth/constants/signin";
import Fields from "@/validations/shared";

export const SigninSchema = z.object({
  email: Fields.email(SIGNIN_CLIENT.VALIDATION_EMAIL_ERROR),
  password: Fields.required(SIGNIN_CLIENT.VALIDATION_PASSWORD_REQUIRED),
});

export type TSigninSchema = z.infer<typeof SigninSchema>;
