import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BRAND } from "@/constants/brand";
import { PRIVATE_ROUTES, PUBLIC_ROUTES } from "@/constants/routes";
import { getCurrentUser } from "@/features/auth/services/server/auth.ports";
import { BUILDINGS_CLIENT } from "@/features/buildings/constants/buildings.constants";
import { BuildingForm } from "@/features/buildings/components/BuildingForm";
import { FloorList } from "@/features/buildings/components/FloorList";
import { getBuildingForEdit, getBuildingFloorsView } from "@/features/buildings/services/server/buildings.ports";
import { DashboardPageContainer } from "@/features/dashboard/components/DashboardPageHeader";

export const metadata: Metadata = {
  title: `${BUILDINGS_CLIENT.EDIT_PAGE_TITLE} | ${BRAND.NAME}`,
};

type BuildingEditPageProps = {
  params: Promise<{ buildingId: string }>;
};

export default async function BuildingEditPage({ params }: BuildingEditPageProps) {
  const { buildingId } = await params;

  const currentUser = await getCurrentUser();
  if (!currentUser.isSuccess) redirect(PUBLIC_ROUTES.SIGNIN);

  const user = currentUser.data;
  const buildingResult = await getBuildingForEdit(user, buildingId);
  if (!buildingResult.isSuccess) redirect(PRIVATE_ROUTES.DASHBOARD);

  const floorsResult = await getBuildingFloorsView(user, buildingId);
  const floors = floorsResult.isSuccess ? floorsResult.data : [];

  return (
    <DashboardPageContainer>
      <div className="w-full">
        <BuildingForm building={buildingResult.data} />
      </div>

      <FloorList
        floors={floors}
        buildingId={buildingId}
        organizationName={buildingResult.data.organizationName}
      />
    </DashboardPageContainer>
  );
}
