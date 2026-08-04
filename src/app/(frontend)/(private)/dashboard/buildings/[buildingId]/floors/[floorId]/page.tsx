import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { BRAND } from "@/constants/brand";
import { PRIVATE_ROUTES, PUBLIC_ROUTES } from "@/constants/routes";
import { getCurrentUser } from "@/features/auth/services/server/auth.ports";
import { BUILDINGS_CLIENT } from "@/features/buildings/constants/buildings.constants";
import { FloorMetadataForm } from "@/features/buildings/components/FloorMetadataForm";
import { getFloorForEdit } from "@/features/buildings/services/server/buildings.ports";

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
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 pb-16 pt-8 sm:px-6 sm:pt-10 lg:px-8">
      <Link
        href={`${PRIVATE_ROUTES.BUILDINGS}/${buildingId}`}
        className="mb-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-3.5" />
        {BUILDINGS_CLIENT.BACK_TO_BUILDING}
      </Link>

      <FloorMetadataForm floor={floorResult.data} />
    </main>
  );
}
