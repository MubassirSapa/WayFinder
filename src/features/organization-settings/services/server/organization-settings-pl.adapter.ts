import "server-only";

import { getPayload } from "payload";

import config from "@payload-config";
import { tryCatchResponse } from "@/lib/responses/trycatch-response";
import { asPayloadId, relationId } from "@/lib/payload-id";
import type { User } from "@/payload-types";

import { ORGANIZATION_SETTINGS_CLIENT } from "../../constants/organization-settings.constants";
import type {
  OrganizationEditData,
  OrganizationType,
  TUpdateOrganizationInput,
} from "../../types/organization-settings.types";

async function getPayloadClient() {
  return getPayload({ config });
}

function toEditData(organization: {
  id: number | string;
  name: string;
  type: OrganizationType;
  logo?: number | { id: number | string } | null;
  logoUrl?: string | null;
}): OrganizationEditData {
  const logoId = relationId(organization.logo);

  return {
    id: String(organization.id),
    name: organization.name,
    type: organization.type,
    logoId: logoId === null ? null : String(logoId),
    logoUrl: organization.logoUrl ?? null,
  };
}

export async function getOrganizationForEditAdapter(user: User) {
  return tryCatchResponse<OrganizationEditData>(async () => {
    const payload = await getPayloadClient();
    const organizationId = relationId(user.organization);
    if (organizationId === null) throw new Error(ORGANIZATION_SETTINGS_CLIENT.ERROR_LOAD_FAILED);

    // depth: 0 is enough — logoUrl is a plain field (denormalized by
    // createSyncMediaUrlHook), so no populate hop into `media` is needed
    // to show the logo. select trims the doc to only what toEditData reads.
    const organization = await payload.findByID({
      collection: "organizations",
      id: organizationId,
      depth: 0,
      select: { name: true, type: true, logo: true, logoUrl: true },
      user,
      overrideAccess: false,
    });

    return toEditData(organization);
  });
}

export async function updateOrganizationAdapter(user: User, input: TUpdateOrganizationInput) {
  return tryCatchResponse<OrganizationEditData>(async () => {
    const payload = await getPayloadClient();
    const organizationId = relationId(user.organization);
    if (organizationId === null) throw new Error(ORGANIZATION_SETTINGS_CLIENT.ERROR_UPDATE_FAILED);

    const data: { name: string; type: OrganizationType; logo?: number | null } = {
      name: input.name,
      type: input.type,
    };

    if (input.logoId) {
      data.logo = asPayloadId(input.logoId);
    } else if (input.removeLogo) {
      data.logo = null;
    }

    const organization = await payload.update({
      collection: "organizations",
      id: organizationId,
      depth: 0,
      select: { name: true, type: true, logo: true, logoUrl: true },
      user,
      overrideAccess: false,
      data,
    });

    return toEditData(organization);
  });
}
