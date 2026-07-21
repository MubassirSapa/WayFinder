"use server";

import { revalidatePath } from "next/cache";

import { PRIVATE_ROUTES } from "@/constants/routes";
import { getCurrentUser } from "@/features/auth/services/server/auth.ports";
import { errorResponse, successResponse } from "@/lib/responses/app-response";
import { DASHBOARD_CLIENT } from "@/features/dashboard/constants/dashboard.constants";
import { createFloor } from "@/features/dashboard/services/server/dashboard.ports";
import {
  CreateFloorSchema,
  type TCreateFloorSchema,
} from "@/features/dashboard/validations/create-floor";

export async function createFloorAction(input: TCreateFloorSchema) {
  const user = await getCurrentUser();
  if (!user.isSuccess) return errorResponse([], DASHBOARD_CLIENT.ERROR_UNAUTHORIZED);

  const validation = CreateFloorSchema.safeParse(input);
  if (!validation.success) {
    return errorResponse([], validation.error.issues[0]?.message ?? DASHBOARD_CLIENT.ERROR_CREATE_FAILED);
  }

  const result = await createFloor(validation.data);
  if (!result.isSuccess) return errorResponse([], DASHBOARD_CLIENT.ERROR_CREATE_FAILED);

  revalidatePath(PRIVATE_ROUTES.DASHBOARD);
  return successResponse(true);
}
