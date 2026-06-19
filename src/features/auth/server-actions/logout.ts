"use server";

import { redirect } from "next/navigation";

import { PUBLIC_ROUTES } from "@/constants/routes";
import { logout } from "@/features/auth/services/auth.ports";

export async function logoutAction() {
  await logout();
  redirect(PUBLIC_ROUTES.SIGNIN);
}
