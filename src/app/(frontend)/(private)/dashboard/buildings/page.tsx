import type { Metadata } from "next";

import { BRAND } from "@/constants/brand";
import { BuildingsList } from "@/features/buildings/components/BuildingsList";
import { BUILDINGS_CLIENT } from "@/features/buildings/constants/buildings.constants";
import { DashboardPageContainer } from "@/features/dashboard/components/DashboardPageHeader";
import { getDashboardData } from "@/features/dashboard/services/server/getDashboardData";

export const metadata: Metadata = {
  title: `${BUILDINGS_CLIENT.LIST_PAGE_TITLE} | ${BRAND.NAME}`,
  description: BUILDINGS_CLIENT.LIST_DESC,
};

export default async function BuildingsPage() {
  const data = await getDashboardData();

  return (
    <DashboardPageContainer>
      <BuildingsList buildings={data.buildings} canManage={data.canManage} />
    </DashboardPageContainer>
  );
}
