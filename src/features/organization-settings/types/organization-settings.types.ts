import type { Organization } from "@/payload-types";

export type OrganizationType = Organization["type"];

export type OrganizationEditData = {
  id: string;
  name: string;
  type: OrganizationType;
  logoId: string | null;
  logoUrl: string | null;
};

export type TUpdateOrganizationInput = {
  name: string;
  type: OrganizationType;
  logoFile: File | null;
  removeLogo: boolean;
};
