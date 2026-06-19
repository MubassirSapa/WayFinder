"use server";

import { redirect } from "next/navigation";

import { SIGNIN_CLIENT } from "@/features/auth/constants/signin";
import { PRIVATE_ROUTES } from "@/constants/routes";
import { errorResponse } from "@/lib/responses/app-response";
import { signIn } from "@/features/auth/services/auth.ports";
import { SigninSchema, type TSigninSchema } from "@/features/auth/validations/signin";

export async function signinAction(data: TSigninSchema) {
  const validation = SigninSchema.safeParse(data);
  if (!validation.success) return errorResponse([], SIGNIN_CLIENT.WRONG_CREDENTIALS);

  const res = await signIn(validation.data);
  if (!res.isSuccess) return errorResponse([], SIGNIN_CLIENT.WRONG_CREDENTIALS);

  redirect(PRIVATE_ROUTES.EDITOR);
}
