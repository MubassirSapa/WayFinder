"use server";

import { revalidatePath } from "next/cache";

import { ROLES } from "@/collections/constants/roles";
import { PRIVATE_ROUTES } from "@/constants/routes";
import { getCurrentUser } from "@/features/auth/services/server/auth.ports";
import { errorResponse, successResponse } from "@/lib/responses/app-response";

import { BUILDINGS_CLIENT } from "../../constants/buildings.constants";
import { createBuilding } from "../../services/server/buildings.ports";
import { BuildingFormSchema } from "../../validations/building-form";

export async function createBuildingAction(formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser.isSuccess) return errorResponse([], BUILDINGS_CLIENT.ERROR_UNAUTHORIZED);

  const user = currentUser.data;
  if (user.role !== ROLES.OWNER && user.role !== ROLES.MANAGER) {
    return errorResponse([], BUILDINGS_CLIENT.ERROR_FORBIDDEN);
  }

  const validation = BuildingFormSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address"),
    contactEmail: formData.get("contactEmail"),
    contactPhone: formData.get("contactPhone"),
    website: formData.get("website"),
  });
  if (!validation.success) {
    return errorResponse([], validation.error.issues[0]?.message ?? BUILDINGS_CLIENT.ERROR_CREATE_FAILED);
  }

  const result = await createBuilding(user, validation.data);
  if (!result.isSuccess) return errorResponse([], result.message || BUILDINGS_CLIENT.ERROR_CREATE_FAILED);

  revalidatePath(PRIVATE_ROUTES.BUILDINGS);
  return successResponse(result.data, BUILDINGS_CLIENT.SUCCESS_CREATED);
}
