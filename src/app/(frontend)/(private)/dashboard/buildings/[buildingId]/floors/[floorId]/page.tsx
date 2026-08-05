import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLinkIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BRAND } from "@/constants/brand";
import { PRIVATE_ROUTES, PUBLIC_ROUTES } from "@/constants/routes";
import { getCurrentUser } from "@/features/auth/services/server/auth.ports";
import {
  buildEditorHref,
  BUILDINGS_CLIENT,
} from "@/features/buildings/constants/buildings.constants";
import { FloorMetadataForm } from "@/features/buildings/components/FloorMetadataForm";
import { getFloorForEdit } from "@/features/buildings/services/server/buildings.ports";
import {
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
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <DashboardPageHeader
          title={floorResult.data.name}
          description={`${floorResult.data.buildingName} - ${BUILDINGS_CLIENT.FLOOR_FORM_DESC}`}
          backHref={`${PRIVATE_ROUTES.BUILDINGS}/${buildingId}`}
          backLabel={BUILDINGS_CLIENT.BACK_TO_BUILDING}
          action={
            <Button
              nativeButton={false}
              render={<Link href={buildEditorHref(floorId)} />}
            >
              <ExternalLinkIcon />
              {BUILDINGS_CLIENT.FLOOR_OPEN_EDITOR}
            </Button>
          }
        />
        <FloorMetadataForm floor={floorResult.data} />
      </div>
    </DashboardPageContainer>
  );
}
