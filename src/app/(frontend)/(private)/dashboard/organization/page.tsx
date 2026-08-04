import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BRAND } from "@/constants/brand";
import { PRIVATE_ROUTES, PUBLIC_ROUTES } from "@/constants/routes";
import { ROLES } from "@/collections/constants/roles";
import { getCurrentUser } from "@/features/auth/services/server/auth.ports";
import { ORGANIZATION_SETTINGS_CLIENT } from "@/features/organization-settings/constants/organization-settings.constants";
import { OrganizationForm } from "@/features/organization-settings/components/OrganizationForm";
import { getOrganizationForEdit } from "@/features/organization-settings/services/server/organization-settings.ports";
import { BuildingsList } from "@/features/buildings/components/BuildingsList";
import { listBuildings } from "@/features/buildings/services/server/buildings.ports";
import { DashboardPageContainer } from "@/features/dashboard/components/DashboardPageHeader";

export const metadata: Metadata = {
  title: `${ORGANIZATION_SETTINGS_CLIENT.PAGE_TITLE} | ${BRAND.NAME}`,
};

export default async function OrganizationPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser.isSuccess) redirect(PUBLIC_ROUTES.SIGNIN);

  const user = currentUser.data;
  if (user.role !== ROLES.OWNER && user.role !== ROLES.MANAGER) {
    redirect(PRIVATE_ROUTES.DASHBOARD);
  }

  const result = await getOrganizationForEdit(user);
  if (!result.isSuccess) redirect(PRIVATE_ROUTES.DASHBOARD);
  const buildingsResult = await listBuildings(user);
  const buildings = buildingsResult.isSuccess ? buildingsResult.data : [];

  return (
    <DashboardPageContainer>
      <OrganizationForm organization={result.data} />
      <BuildingsList buildings={buildings} canManage />
    </DashboardPageContainer>
  );
}
