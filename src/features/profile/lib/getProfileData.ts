import { redirect } from "next/navigation";

import { PRIVATE_ROUTES } from "@/constants/routes";

import { getOrganizationProfile } from "../services/server/profile.ports";

export async function getProfileData() {
  const result = await getOrganizationProfile();
  if (!result.isSuccess) redirect(PRIVATE_ROUTES.DASHBOARD);
  return result.data;
}
