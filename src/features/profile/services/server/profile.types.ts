import type { TUpdateOrganizationProfile } from "../../validations/update-organization-profile";

export type TUpdateOrganizationProfileRecord = TUpdateOrganizationProfile & {
  organizationId: string;
};
