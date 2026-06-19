"use server";

import { redirect } from "next/navigation";

import { errorResponse } from "@/lib/responses/app-response";
import { signUp } from "@/features/auth/services/auth.ports";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { SIGNUP_CLIENT } from "@/features/auth/constants/signup";
import { SignupActionSchema, TSignupActionSchema } from "@/features/auth/validations/signup";

export async function signupAction(data: TSignupActionSchema) {
  const validation = SignupActionSchema.safeParse(data);
  if (!validation.success) {
    const errors = validation.error.issues.map((issue) => ({
      message: issue.message,
      code: issue.code,
    }));

    return errorResponse(errors, errors[0]?.message ?? SIGNUP_CLIENT.FALLBACK_SERVER_ERROR);
  }

  const res = await signUp(validation.data);
  if (!res.isSuccess) {
    const isDuplicate = res.errors.some(
      (e) => e.code === "EMAIL_ALREADY_EXISTS" || /duplicate|already exists|unique/i.test(e.message),
    );
    const message = isDuplicate ? SIGNUP_CLIENT.EMAIL_TAKEN : res.message;

    return errorResponse(res.errors, message || SIGNUP_CLIENT.FALLBACK_SERVER_ERROR);
  }

  redirect(PUBLIC_ROUTES.CHECK_EMAIL);
}
