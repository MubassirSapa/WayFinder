import type { ORGANIZATION_TYPES } from "@/features/auth/constants/register-organization";

export type OrganizationType = (typeof ORGANIZATION_TYPES)[number]["value"];

export type OrganizationProfile = {
  id: string;
  name: string;
  type: OrganizationType;
  typeLabel: string;
  initials: string;
  contact: {
    email: string;
    phone: string;
    website: string;
  };
  address: {
    line1: string;
    line2: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
};

export type ProfileAccount = {
  name: string;
  email: string;
};

export type ProfileData = {
  organization: OrganizationProfile;
  account: ProfileAccount;
};
