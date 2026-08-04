"use server";

import { revalidatePath } from "next/cache";

import { PRIVATE_ROUTES } from "@/constants/routes";
import { getCurrentUser } from "@/features/auth/services/server/auth.ports";
import { errorResponse, successResponse } from "@/lib/responses/app-response";

import { BUILDINGS_CLIENT } from "../../constants/buildings.constants";
import { createFloor } from "../../services/server/buildings.ports";
import { CreateFloorSchema, type TCreateFloorSchema } from "../../validations/create-floor";

export async function createFloorAction(input: TCreateFloorSchema) {
  const currentUser = await getCurrentUser();
  if (!currentUser.isSuccess) return errorResponse([], BUILDINGS_CLIENT.ERROR_UNAUTHORIZED);

  const validation = CreateFloorSchema.safeParse(input);
  if (!validation.success) {
    return errorResponse([], validation.error.issues[0]?.message ?? BUILDINGS_CLIENT.ERROR_CREATE_FLOOR_FAILED);
  }

  const result = await createFloor(currentUser.data, validation.data);
  if (!result.isSuccess) return errorResponse([], result.message || BUILDINGS_CLIENT.ERROR_CREATE_FLOOR_FAILED);

  revalidatePath(`${PRIVATE_ROUTES.BUILDINGS}/${validation.data.buildingId}`);
  return successResponse(true);
}
