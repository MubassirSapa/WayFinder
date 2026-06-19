"use server";

import { revalidatePath } from "next/cache";

import { PRIVATE_ROUTES } from "@/constants/routes";
import { getCurrentUser } from "@/features/auth/services/auth.ports";
import { errorResponse, successResponse } from "@/lib/responses/app-response";
import { DASHBOARD_CLIENT } from "@/features/dashboard/constants/dashboard.constants";
import { setFloorStatus } from "@/features/dashboard/services/dashboard.ports";

export async function toggleFloorStatusAction(floorId: string, publish: boolean) {
  const user = await getCurrentUser();
  if (!user.isSuccess) return errorResponse([], DASHBOARD_CLIENT.ERROR_UNAUTHORIZED);

  const result = await setFloorStatus({
    id: floorId,
    status: publish ? "published" : "draft",
  });
  if (!result.isSuccess) return errorResponse([], DASHBOARD_CLIENT.ERROR_TOGGLE_FAILED);

  revalidatePath(PRIVATE_ROUTES.DASHBOARD);
  return successResponse(true);
}
