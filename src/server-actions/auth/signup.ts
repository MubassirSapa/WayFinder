"use server";

import { redirect } from "next/navigation";

import { errorResponse } from "@/lib/responses/app-response";
import { signUp } from "@/services/auth/auth.ports";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { SIGNUP_CLIENT } from "@/constants/auth/signup";
import { SignupActionSchema, TSignupActionSchema } from "@/validations/auth/signup";

export async function signupAction(data: TSignupActionSchema) {
  const validation = SignupActionSchema.safeParse(data);
  if (!validation.success) return errorResponse([], SIGNUP_CLIENT.FALLBACK_SERVER_ERROR);

  const res = await signUp(validation.data);
  if (!res.isSuccess) {
    const isDuplicate = res.errors.some((e) => /duplicate|already exists|unique/i.test(e.message));
    return errorResponse([], isDuplicate ? SIGNUP_CLIENT.EMAIL_TAKEN : SIGNUP_CLIENT.FALLBACK_SERVER_ERROR);
  }

  redirect(PUBLIC_ROUTES.CHECK_EMAIL);
}
