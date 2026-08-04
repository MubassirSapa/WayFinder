import "server-only";

import { headers as getHeaders } from "next/headers";
import { getPayload } from "payload";

import config from "@payload-config";
import type { Organization, User } from "@/payload-types";
import { errorResponse, successResponse } from "@/lib/responses/app-response";
import { tryCatchResponse } from "@/lib/responses/trycatch-response";

import { PROFILE_CLIENT } from "../../constants/profile.constants";
import { organizationInitials, organizationTypeLabel } from "../../lib/profile-presentation";
import type { OrganizationType, ProfileData } from "../../types/profile.types";
import type { TUpdateOrganizationProfileRecord } from "./profile.types";

function getRelationId(relation: unknown) {
  if (relation === null || relation === undefined) return null;
  if (typeof relation === "object" && "id" in relation) {
    const id = (relation as { id: unknown }).id;
    return id === null || id === undefined ? null : String(id);
  }
  return String(relation);
}

function textValue(value: string | null | undefined) {
  return value ?? "";
}

export async function getOrganizationProfileAdapter() {
  const headers = await getHeaders();
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers });

  if (!user || user.collection !== "users") {
    return errorResponse([], PROFILE_CLIENT.ERROR_UNAUTHORIZED);
  }

  const currentUser = user as User;
  const organizationId = getRelationId(currentUser.organization);
  if (!organizationId) {
    return errorResponse([], PROFILE_CLIENT.ERROR_NO_ORGANIZATION);
  }

  const result = await tryCatchResponse(() =>
    payload.findByID({
      collection: "organizations",
      id: organizationId,
      overrideAccess: true,
    }),
  );
  if (!result.isSuccess) return result;

  const organization = result.data as Organization;
  const type = organization.type as OrganizationType;
  const data: ProfileData = {
    organization: {
      id: String(organization.id),
      name: organization.name,
      type,
      typeLabel: organizationTypeLabel(type),
      initials: organizationInitials(organization.name),
      contact: {
        email: textValue(organization.contact?.email),
        phone: textValue(organization.contact?.phone),
        website: textValue(organization.contact?.website),
      },
      address: {
        line1: textValue(organization.address?.line1),
        line2: textValue(organization.address?.line2),
        city: textValue(organization.address?.city),
        region: textValue(organization.address?.region),
        postalCode: textValue(organization.address?.postalCode),
        country: textValue(organization.address?.country),
      },
    },
    account: {
      name: currentUser.name || currentUser.email,
      email: currentUser.email,
    },
  };

  return successResponse(data);
}

export async function updateOrganizationProfileAdapter({
  organizationId,
  name,
  type,
  email,
  phone,
  website,
  addressLine1,
  addressLine2,
  city,
  region,
  postalCode,
  country,
}: TUpdateOrganizationProfileRecord) {
  const payload = await getPayload({ config });

  return tryCatchResponse(() =>
    payload.update({
      collection: "organizations",
      id: organizationId,
      overrideAccess: true,
      data: {
        name,
        type,
        contact: { email, phone, website },
        address: {
          line1: addressLine1,
          line2: addressLine2,
          city,
          region,
          postalCode,
          country,
        },
      },
    }),
  );
}
