import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BRAND } from "@/constants/brand";
import { PRIVATE_ROUTES, PUBLIC_ROUTES } from "@/constants/routes";
import { isOwnerOrManager } from "@/collections/constants/roles";
import { getCurrentUser } from "@/features/auth/services/server/auth.ports";
import {
  DashboardBackLink,
  DashboardPageContainer,
} from "@/features/dashboard/components/DashboardPageHeader";
import { USER_MANAGEMENT_CLIENT } from "@/features/user-management/constants/user-management.constants";
import { UserDetailPanel } from "@/features/user-management/components/UserDetailPanel";
import { getOrgUserDetail, listOrgBuildingOptions } from "@/features/user-management/services/server/user-management.ports";

export const metadata: Metadata = {
  title: `${USER_MANAGEMENT_CLIENT.PAGE_TITLE} | ${BRAND.NAME}`,
};

type UserDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;

  const currentUser = await getCurrentUser();
  if (!currentUser.isSuccess) redirect(PUBLIC_ROUTES.SIGNIN);

  const user = currentUser.data;
  const canManageTeam = isOwnerOrManager(user.role);
  // A member can only ever reach their own page - everyone else's is still
  // owner/manager-only, matching Payload's own userRead access exactly (see
  // docs on the plan for this feature).
  if (!canManageTeam && String(user.id) !== id) redirect(PRIVATE_ROUTES.DASHBOARD);

  const [detailResult, buildingOptions] = await Promise.all([
    getOrgUserDetail(user, id),
    listOrgBuildingOptions(user),
  ]);
  if (!detailResult.isSuccess) redirect(PRIVATE_ROUTES.USERS);

  return (
    <DashboardPageContainer>
      <DashboardBackLink
        href={canManageTeam ? PRIVATE_ROUTES.USERS : PRIVATE_ROUTES.DASHBOARD}
        label={canManageTeam ? USER_MANAGEMENT_CLIENT.BACK_TO_TEAM : USER_MANAGEMENT_CLIENT.BACK_TO_DASHBOARD}
      />

      <UserDetailPanel user={detailResult.data} buildingOptions={buildingOptions} />
    </DashboardPageContainer>
  );
}
