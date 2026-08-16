import type { Metadata } from "next";
import { redirect } from "next/navigation";

import PendingApprovalSection from "@/features/auth/pages/pending-approval/sections/PendingApprovalSection";
import { getCurrentUser, getCurrentUserOrganizationName } from "@/features/auth/services/server/auth.ports";
import { BRAND } from "@/constants/brand";
import { PUBLIC_ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: `Pending Review | ${BRAND.NAME}`,
};

export default async function PendingApprovalPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser.isSuccess) redirect(PUBLIC_ROUTES.SIGNIN);

  const organizationNameResult = await getCurrentUserOrganizationName();
  const organizationName = organizationNameResult.isSuccess
    ? organizationNameResult.data
    : "Your organization";

  return <PendingApprovalSection organizationName={organizationName} />;
}
