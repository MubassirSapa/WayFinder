import { z } from "zod";

import Fields from "@/validations/shared";
import { SIGNUP_CLIENT } from "@/features/auth/constants/signup";
import { OrganizationSchema } from "./organization";

export const SignupSchema = z
  .object({
    name: Fields.name({ min: SIGNUP_CLIENT.VALIDATION_NAME_ERROR }),
    email: Fields.email(SIGNUP_CLIENT.VALIDATION_EMAIL_ERROR),
    password: Fields.password({
      min: SIGNUP_CLIENT.VALIDATION_PASSWORD_MIN,
      strength: SIGNUP_CLIENT.VALIDATION_PASSWORD_STRENGTH,
    }),
    confirmPassword: z.string(),
    agreedToTerms: z.literal(true, SIGNUP_CLIENT.VALIDATION_TERMS_REQUIRED),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: SIGNUP_CLIENT.VALIDATION_CONFIRM_MISMATCH,
    path: ["confirmPassword"],
  });

export const SignupActionSchema = z.object({
  name: Fields.name({ min: SIGNUP_CLIENT.VALIDATION_NAME_ERROR }),
  email: Fields.email(SIGNUP_CLIENT.VALIDATION_EMAIL_ERROR),
  password: Fields.password({
    min: SIGNUP_CLIENT.VALIDATION_PASSWORD_MIN,
    strength: SIGNUP_CLIENT.VALIDATION_PASSWORD_STRENGTH,
  }),
  organization: OrganizationSchema,
});

export type TSignupSchema = z.infer<typeof SignupSchema>;
export type TSignupActionSchema = z.infer<typeof SignupActionSchema>;
