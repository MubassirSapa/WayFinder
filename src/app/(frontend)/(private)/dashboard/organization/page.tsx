import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BRAND } from "@/constants/brand";
import { PRIVATE_ROUTES, PUBLIC_ROUTES } from "@/constants/routes";
import { ROLES } from "@/collections/constants/roles";
import { getCurrentUser } from "@/features/auth/services/server/auth.ports";
import { ORGANIZATION_SETTINGS_CLIENT } from "@/features/organization-settings/constants/organization-settings.constants";
import { OrganizationForm } from "@/features/organization-settings/components/OrganizationForm";
import { getOrganizationForEdit } from "@/features/organization-settings/services/server/organization-settings.ports";

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

  return (
    <main className="mx-auto flex w-full max-w-270 flex-1 flex-col px-4 pb-16 pt-8 sm:px-6 sm:pt-10 lg:px-8">
      <OrganizationForm organization={result.data} />
    </main>
  );
}
