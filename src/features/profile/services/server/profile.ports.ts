import {
  getOrganizationProfileAdapter,
  updateOrganizationProfileAdapter,
} from "./profile-pl.adapter";
import type { TUpdateOrganizationProfileRecord } from "./profile.types";

export async function getOrganizationProfile() {
  return getOrganizationProfileAdapter();
}

export async function updateOrganizationProfile(data: TUpdateOrganizationProfileRecord) {
  return updateOrganizationProfileAdapter(data);
}
