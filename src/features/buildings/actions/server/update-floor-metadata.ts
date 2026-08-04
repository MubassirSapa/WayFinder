"use server";

import { revalidatePath } from "next/cache";

import { PRIVATE_ROUTES } from "@/constants/routes";
import { getCurrentUser } from "@/features/auth/services/server/auth.ports";
import { errorResponse, successResponse } from "@/lib/responses/app-response";

import { BUILDINGS_CLIENT } from "../../constants/buildings.constants";
import { updateFloorMetadata } from "../../services/server/buildings.ports";
import { FloorMetadataSchema } from "../../validations/floor-metadata";

export async function updateFloorMetadataAction(buildingId: string, floorId: string, formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser.isSuccess) return errorResponse([], BUILDINGS_CLIENT.ERROR_UNAUTHORIZED);

  const validation = FloorMetadataSchema.safeParse({
    name: formData.get("name"),
    level: formData.get("level"),
    width: formData.get("width"),
    height: formData.get("height"),
    metersPerPixel: formData.get("metersPerPixel") || undefined,
    status: formData.get("status"),
  });
  if (!validation.success) {
    return errorResponse([], validation.error.issues[0]?.message ?? BUILDINGS_CLIENT.ERROR_FLOOR_UPDATE_FAILED);
  }

  const result = await updateFloorMetadata(currentUser.data, floorId, validation.data);
  if (!result.isSuccess) return errorResponse([], result.message || BUILDINGS_CLIENT.ERROR_FLOOR_UPDATE_FAILED);

  revalidatePath(`${PRIVATE_ROUTES.BUILDINGS}/${buildingId}`);
  revalidatePath(`${PRIVATE_ROUTES.BUILDINGS}/${buildingId}/floors/${floorId}`);
  return successResponse(result.data, BUILDINGS_CLIENT.SUCCESS_FLOOR_UPDATED);
}
