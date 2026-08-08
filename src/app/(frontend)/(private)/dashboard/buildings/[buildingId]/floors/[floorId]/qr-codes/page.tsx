import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BRAND } from "@/constants/brand";
import { PRIVATE_ROUTES, PUBLIC_ROUTES } from "@/constants/routes";
import { getCurrentUser } from "@/features/auth/services/server/auth.ports";
import { BUILDINGS_CLIENT } from "@/features/buildings/constants/buildings.constants";
import {
  DashboardBackLink,
  DashboardPageContainer,
  DashboardPageHeader,
} from "@/features/dashboard/components/DashboardPageHeader";
import { QR_CODES_CLIENT } from "@/features/qr-codes/constants/qrCodes.constants";
import { QrFloorViewer } from "@/features/qr-codes/components/QrFloorViewer";
import { getFloorForQrViewer } from "@/features/qr-codes/services/server/qrFloorViewer.ports";

export const metadata: Metadata = {
  title: `${QR_CODES_CLIENT.PAGE_TITLE} | ${BRAND.NAME}`,
  description: QR_CODES_CLIENT.PAGE_DESCRIPTION,
};

type QrCodesPageProps = {
  params: Promise<{ buildingId: string; floorId: string }>;
};

export default async function QrCodesPage({ params }: QrCodesPageProps) {
  const { buildingId, floorId } = await params;

  const currentUser = await getCurrentUser();
  if (!currentUser.isSuccess) redirect(PUBLIC_ROUTES.SIGNIN);

  const floorResult = await getFloorForQrViewer(currentUser.data, floorId);
  if (!floorResult.isSuccess) {
    redirect(PRIVATE_ROUTES.DASHBOARD);
  }

  const floor = floorResult.data.floors[0];
  if (!floor || floor.buildingId !== buildingId) {
    redirect(PRIVATE_ROUTES.DASHBOARD);
  }

  return (
    <DashboardPageContainer>
      <DashboardBackLink
        href={`${PRIVATE_ROUTES.BUILDINGS}/${buildingId}`}
        label={BUILDINGS_CLIENT.BACK_TO_BUILDING}
      />

      <DashboardPageHeader
        className="border-y border-border py-5 sm:py-6"
        description={QR_CODES_CLIENT.PAGE_DESCRIPTION}
        title={floor.name}
      />
      <QrFloorViewer data={floorResult.data} />
    </DashboardPageContainer>
  );
}
