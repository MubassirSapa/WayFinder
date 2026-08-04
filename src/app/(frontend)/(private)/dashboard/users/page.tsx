import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BRAND } from "@/constants/brand";
import { PRIVATE_ROUTES, PUBLIC_ROUTES } from "@/constants/routes";
import { ROLES } from "@/collections/constants/roles";
import { getCurrentUser } from "@/features/auth/services/server/auth.ports";
import { USER_MANAGEMENT_CLIENT } from "@/features/user-management/constants/user-management.constants";
import { UserManagementTable } from "@/features/user-management/components/UserManagementTable";
import { listOrgBuildingOptions, listOrgUsers } from "@/features/user-management/services/server/user-management.ports";
import { DashboardPageContainer } from "@/features/dashboard/components/DashboardPageHeader";

export const metadata: Metadata = {
  title: `${USER_MANAGEMENT_CLIENT.PAGE_TITLE} | ${BRAND.NAME}`,
};

export default async function UsersPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser.isSuccess) redirect(PUBLIC_ROUTES.SIGNIN);

  const user = currentUser.data;
  if (user.role !== ROLES.OWNER && user.role !== ROLES.MANAGER) {
    redirect(PRIVATE_ROUTES.DASHBOARD);
  }

  const [usersResult, buildingOptions] = await Promise.all([
    listOrgUsers(user),
    listOrgBuildingOptions(user),
  ]);
  const users = usersResult.isSuccess ? usersResult.data : [];

  return (
    <DashboardPageContainer>
      <UserManagementTable users={users} buildingOptions={buildingOptions} />
    </DashboardPageContainer>
  );
}
