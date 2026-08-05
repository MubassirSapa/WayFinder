"use server";

import { revalidatePath } from "next/cache";

import { ROLES } from "@/collections/constants/roles";
import { PRIVATE_ROUTES } from "@/constants/routes";
import { getCurrentUser } from "@/features/auth/services/server/auth.ports";
import { errorResponse, successResponse } from "@/lib/responses/app-response";

import { BUILDINGS_CLIENT } from "../../constants/buildings.constants";
import { updateBuilding } from "../../services/server/buildings.ports";
import { BuildingFormSchema } from "../../validations/building-form";

export async function updateBuildingAction(buildingId: string, formData: FormData) {
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
    return errorResponse([], validation.error.issues[0]?.message ?? BUILDINGS_CLIENT.ERROR_UPDATE_FAILED);
  }

  const logoIdEntry = formData.get("logoId");
  const logoId = typeof logoIdEntry === "string" && logoIdEntry.length > 0 ? logoIdEntry : null;

  const result = await updateBuilding(user, buildingId, {
    ...validation.data,
    logoId,
    removeLogo: formData.get("removeLogo") === "true",
  });
  if (!result.isSuccess) return errorResponse([], result.message || BUILDINGS_CLIENT.ERROR_UPDATE_FAILED);

  revalidatePath(`${PRIVATE_ROUTES.BUILDINGS}/${buildingId}`);
  revalidatePath(PRIVATE_ROUTES.BUILDINGS);
  return successResponse(result.data, BUILDINGS_CLIENT.SUCCESS_UPDATED);
}
