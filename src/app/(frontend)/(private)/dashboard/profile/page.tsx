import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BRAND } from "@/constants/brand";
import { PRIVATE_ROUTES, PUBLIC_ROUTES } from "@/constants/routes";
import { getCurrentUser } from "@/features/auth/services/server/auth.ports";
import { PROFILE_CLIENT } from "@/features/profile/constants/profile.constants";
import { ProfileForm } from "@/features/profile/components/ProfileForm";
import { getProfileForEdit } from "@/features/profile/services/server/profile.ports";
import { DashboardPageContainer } from "@/features/dashboard/components/DashboardPageHeader";

export const metadata: Metadata = {
  title: `${PROFILE_CLIENT.PAGE_TITLE} | ${BRAND.NAME}`,
};

export default async function ProfilePage() {
  const currentUser = await getCurrentUser();
  if (!currentUser.isSuccess) redirect(PUBLIC_ROUTES.SIGNIN);

  const result = await getProfileForEdit(currentUser.data);
  if (!result.isSuccess) redirect(PRIVATE_ROUTES.DASHBOARD);

  return (
    <DashboardPageContainer>
      <ProfileForm profile={result.data} />
    </DashboardPageContainer>
  );
}
