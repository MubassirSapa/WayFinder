import type { Metadata } from "next";

import { BRAND } from "@/constants/brand";
import { ProfileShell } from "@/features/profile/components/ProfileShell";
import { PROFILE_CLIENT } from "@/features/profile/constants/profile.constants";
import { getProfileData } from "@/features/profile/lib/getProfileData";

export const metadata: Metadata = {
  title: `${PROFILE_CLIENT.PAGE_TITLE} | ${BRAND.NAME}`,
};

export default async function ProfilePage() {
  const data = await getProfileData();
  return <ProfileShell data={data} />;
}
