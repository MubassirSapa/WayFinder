import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { BRAND } from "@/constants/brand";
import { PRIVATE_ROUTES, PUBLIC_ROUTES } from "@/constants/routes";
import { getCurrentUser } from "@/features/auth/services/server/auth.ports";
import { BUILDINGS_CLIENT } from "@/features/buildings/constants/buildings.constants";
import { BuildingForm } from "@/features/buildings/components/BuildingForm";
import { FloorList } from "@/features/buildings/components/FloorList";
import { getBuildingForEdit, getBuildingFloorsView } from "@/features/buildings/services/server/buildings.ports";

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
    <main className="mx-auto flex w-full max-w-270 flex-1 flex-col gap-9 px-4 pb-16 pt-8 sm:px-6 sm:pt-10 lg:px-8">
      <Link
        href={PRIVATE_ROUTES.DASHBOARD}
        className="inline-flex w-fit items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-3.5" />
        {BUILDINGS_CLIENT.BACK_TO_DASHBOARD}
      </Link>

      <div className="mx-auto w-full max-w-xl">
        <BuildingForm building={buildingResult.data} />
      </div>

      <FloorList
        floors={floors}
        buildingId={buildingId}
        organizationName={buildingResult.data.organizationName}
      />
    </main>
  );
}
