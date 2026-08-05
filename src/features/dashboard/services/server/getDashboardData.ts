import { headers as getHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";

import config from "@payload-config";
import { ROLES } from "@/collections/constants/roles";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { relationId } from "@/lib/payload-id";
import { listBuildings } from "@/features/buildings/services/server/buildings.ports";
import type { Organization, User } from "@/payload-types";

import { DASHBOARD_CLIENT } from "../../constants/dashboard.constants";
import { organizationInitials, organizationTypeLabel } from "../../lib/organizationPresentation";
import type { DashboardData } from "../../types/dashboard.types";

export async function getDashboardData(): Promise<DashboardData> {
  const headers = await getHeaders();
  const payload = await getPayload({ config });

  const { user } = await payload.auth({ headers });
  if (!user) redirect(PUBLIC_ROUTES.SIGNIN);

  const currentUser = user as User;
  const organizationId = relationId(currentUser.organization);

  let organization: Pick<Organization, "name" | "type" | "logoUrl"> | null = null;
  if (organizationId) {
    try {
      // depth: 0 is enough — logoUrl is a plain field (denormalized by
      // createSyncMediaUrlHook), so no populate hop into `media` is needed.
      // select trims the doc to only what's read below.
      organization = await payload.findByID({
        collection: "organizations",
        id: organizationId,
        depth: 0,
        select: { name: true, type: true, logoUrl: true },
        user: currentUser,
        overrideAccess: false,
      });
    } catch {
      organization = null;
    }
  }

  const buildingsResult = await listBuildings(currentUser);
  const buildings = buildingsResult.isSuccess ? buildingsResult.data : [];

  const name = currentUser.name ?? "";
  const email = currentUser.email ?? "";
  const initial = (name.trim()[0] ?? email.trim()[0] ?? "A").toUpperCase();

  return {
    user: {
      name: name || email,
      email,
      initial,
      role: currentUser.role,
    },
    organization: {
      id: organizationId === null ? null : String(organizationId),
      name: organization?.name ?? DASHBOARD_CLIENT.ORG_FALLBACK_NAME,
      initials: organizationInitials(organization?.name ?? DASHBOARD_CLIENT.ORG_FALLBACK_NAME),
      typeLabel: organizationTypeLabel(organization?.type),
      logoUrl: organization?.logoUrl ?? null,
    },
    buildings,
    canManage: currentUser.role === ROLES.OWNER || currentUser.role === ROLES.MANAGER,
  };
}
