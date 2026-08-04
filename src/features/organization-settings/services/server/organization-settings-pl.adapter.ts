import "server-only";

import { getPayload } from "payload";

import config from "@payload-config";
import { tryCatchResponse } from "@/lib/responses/trycatch-response";
import { relationId } from "@/lib/payload-id";
import type { User } from "@/payload-types";

import { MAX_LOGO_SIZE_BYTES, ORGANIZATION_SETTINGS_CLIENT } from "../../constants/organization-settings.constants";
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
  logo?: number | { id: number | string; url?: string | null } | null;
}): OrganizationEditData {
  const logo = typeof organization.logo === "object" && organization.logo ? organization.logo : null;

  return {
    id: String(organization.id),
    name: organization.name,
    type: organization.type,
    logoId: logo ? String(logo.id) : null,
    logoUrl: logo?.url ?? null,
  };
}

export async function getOrganizationForEditAdapter(user: User) {
  return tryCatchResponse<OrganizationEditData>(async () => {
    const payload = await getPayloadClient();
    const organizationId = relationId(user.organization);
    if (organizationId === null) throw new Error(ORGANIZATION_SETTINGS_CLIENT.ERROR_LOAD_FAILED);

    const organization = await payload.findByID({
      collection: "organizations",
      id: organizationId,
      depth: 1,
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

    if (input.logoFile) {
      if (!input.logoFile.type.startsWith("image/")) throw new Error(ORGANIZATION_SETTINGS_CLIENT.ERROR_LOGO_TYPE);
      if (input.logoFile.size > MAX_LOGO_SIZE_BYTES) throw new Error(ORGANIZATION_SETTINGS_CLIENT.ERROR_LOGO_SIZE);

      const buffer = Buffer.from(await input.logoFile.arrayBuffer());
      const media = await payload.create({
        collection: "media",
        data: { alt: `${input.name} logo` },
        file: {
          data: buffer,
          mimetype: input.logoFile.type,
          name: input.logoFile.name,
          size: input.logoFile.size,
        },
        user,
        overrideAccess: false,
      });
      data.logo = media.id;
    } else if (input.removeLogo) {
      data.logo = null;
    }

    const organization = await payload.update({
      collection: "organizations",
      id: organizationId,
      depth: 1,
      user,
      overrideAccess: false,
      data,
    });

    return toEditData(organization);
  });
}
