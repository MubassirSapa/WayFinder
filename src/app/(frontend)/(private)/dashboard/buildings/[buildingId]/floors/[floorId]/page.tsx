import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLinkIcon, QrCodeIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BRAND } from "@/constants/brand";
import { PRIVATE_ROUTES, PUBLIC_ROUTES } from "@/constants/routes";
import { getCurrentUser } from "@/features/auth/services/server/auth.ports";
import {
  buildEditorHref,
  buildQrCodesHref,
  BUILDINGS_CLIENT,
} from "@/features/buildings/constants/buildings.constants";
import { FloorMetadataForm } from "@/features/buildings/components/FloorMetadataForm";
import { getFloorForEdit } from "@/features/buildings/services/server/buildings.ports";
import {
  DashboardBackLink,
  DashboardPageContainer,
  DashboardPageHeader,
} from "@/features/dashboard/components/DashboardPageHeader";

export const metadata: Metadata = {
  title: `${BUILDINGS_CLIENT.FLOOR_EDIT_PAGE_TITLE} | ${BRAND.NAME}`,
};

type FloorEditPageProps = {
  params: Promise<{ buildingId: string; floorId: string }>;
};

export default async function FloorEditPage({ params }: FloorEditPageProps) {
  const { buildingId, floorId } = await params;

  const currentUser = await getCurrentUser();
  if (!currentUser.isSuccess) redirect(PUBLIC_ROUTES.SIGNIN);

  const floorResult = await getFloorForEdit(currentUser.data, floorId);
  if (!floorResult.isSuccess || floorResult.data.buildingId !== buildingId) {
    redirect(PRIVATE_ROUTES.DASHBOARD);
  }

  return (
    <DashboardPageContainer>
      <DashboardBackLink
        href={`${PRIVATE_ROUTES.BUILDINGS}/${buildingId}`}
        label={BUILDINGS_CLIENT.BACK_TO_BUILDING}
      />

      <DashboardPageHeader
        title={floorResult.data.name}
        description={`${floorResult.data.buildingName} - ${BUILDINGS_CLIENT.FLOOR_FORM_DESC}`}
        className="border-y border-border py-5 sm:py-6"
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              nativeButton={false}
              render={<Link href={buildQrCodesHref(buildingId, floorId)} />}
              variant="outline"
            >
              <QrCodeIcon />
              {BUILDINGS_CLIENT.FLOOR_OPEN_QR_CODES}
            </Button>
            <Button
              nativeButton={false}
              render={<Link href={buildEditorHref(floorId)} />}
            >
              <ExternalLinkIcon />
              {BUILDINGS_CLIENT.FLOOR_OPEN_EDITOR}
            </Button>
          </div>
        }
      />
      <FloorMetadataForm floor={floorResult.data} />
    </DashboardPageContainer>
  );
}
