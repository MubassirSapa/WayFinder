import type { User } from "@/payload-types";

import { getOrganizationForEditAdapter, updateOrganizationAdapter } from "./organization-settings-pl.adapter";
import type { TUpdateOrganizationInput } from "../../types/organization-settings.types";

export async function getOrganizationForEdit(user: User) {
  return getOrganizationForEditAdapter(user);
}

export async function updateOrganization(user: User, input: TUpdateOrganizationInput) {
  return updateOrganizationAdapter(user, input);
}
