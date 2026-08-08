import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BRAND } from "@/constants/brand";
import { PRIVATE_ROUTES, PUBLIC_ROUTES } from "@/constants/routes";
import { isOwnerOrManager } from "@/collections/constants/roles";
import { getCurrentUser } from "@/features/auth/services/server/auth.ports";
import { listPendingInvitations } from "@/features/invitations/services/server/invitation.ports";
import { USER_MANAGEMENT_CLIENT } from "@/features/user-management/constants/user-management.constants";
import { TeamDirectory } from "@/features/user-management/components/TeamDirectory";
import {
  listOrgBuildingOptions,
  listOrgUsers,
} from "@/features/user-management/services/server/user-management.ports";
import { DashboardPageContainer } from "@/features/dashboard/components/DashboardPageHeader";

export const metadata: Metadata = {
  title: `${USER_MANAGEMENT_CLIENT.PAGE_TITLE} | ${BRAND.NAME}`,
  description: USER_MANAGEMENT_CLIENT.PAGE_DESCRIPTION,
};

export default async function UsersPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser.isSuccess) redirect(PUBLIC_ROUTES.SIGNIN);

  const user = currentUser.data;
  if (!isOwnerOrManager(user.role)) {
    redirect(PRIVATE_ROUTES.DASHBOARD);
  }

  const [usersResult, buildingOptions, pendingInvitationsResult] =
    await Promise.all([
      listOrgUsers(user),
      listOrgBuildingOptions(user),
      listPendingInvitations(user),
    ]);
  const users = usersResult.isSuccess ? usersResult.data : [];
  const pendingInvitations = pendingInvitationsResult.isSuccess
    ? pendingInvitationsResult.data
    : [];

  return (
    <DashboardPageContainer>
      <TeamDirectory
        users={users}
        buildingOptions={buildingOptions}
        pendingInvitations={pendingInvitations}
      />
    </DashboardPageContainer>
  );
}
