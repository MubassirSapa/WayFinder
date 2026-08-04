import type { User } from "@/payload-types";

import { getProfileForEditAdapter, updateProfileAdapter } from "./profile-pl.adapter";
import type { TUpdateProfileInput } from "../../types/profile.types";

export async function getProfileForEdit(user: User) {
  return getProfileForEditAdapter(user);
}

export async function updateProfile(user: User, input: TUpdateProfileInput) {
  return updateProfileAdapter(user, input);
}
