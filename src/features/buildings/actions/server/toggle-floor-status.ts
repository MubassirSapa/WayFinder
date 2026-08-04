"use server";

import { revalidatePath } from "next/cache";

import { PRIVATE_ROUTES } from "@/constants/routes";
import { getCurrentUser } from "@/features/auth/services/server/auth.ports";
import { errorResponse, successResponse } from "@/lib/responses/app-response";

import { BUILDINGS_CLIENT } from "../../constants/buildings.constants";
import { setFloorStatus } from "../../services/server/buildings.ports";

export async function toggleFloorStatusAction(floorId: string, publish: boolean) {
  const currentUser = await getCurrentUser();
  if (!currentUser.isSuccess) return errorResponse([], BUILDINGS_CLIENT.ERROR_UNAUTHORIZED);

  const result = await setFloorStatus(currentUser.data, {
    id: floorId,
    status: publish ? "published" : "draft",
  });
  if (!result.isSuccess) return errorResponse([], BUILDINGS_CLIENT.ERROR_TOGGLE_FLOOR_FAILED);

  revalidatePath(PRIVATE_ROUTES.DASHBOARD);
  return successResponse(true);
}
