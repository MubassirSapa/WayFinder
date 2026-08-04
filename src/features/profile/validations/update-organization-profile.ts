import { z } from "zod";

import { ORGANIZATION_TYPES } from "@/features/auth/constants/register-organization";

import { PROFILE_CLIENT } from "../constants/profile.constants";

const organizationTypes = ORGANIZATION_TYPES.map((option) => option.value);

function optionalText(maxLength: number, message: string) {
  return z
    .string()
    .trim()
    .max(maxLength, message)
    .transform((value) => value || null);
}

const OptionalEmailSchema = z
  .string()
  .trim()
  .refine(
    (value) => value.length === 0 || z.email().safeParse(value).success,
    PROFILE_CLIENT.VALIDATION_EMAIL,
  )
  .transform((value) => value || null);

const OptionalWebsiteSchema = z
  .string()
  .trim()
  .max(2048, PROFILE_CLIENT.VALIDATION_WEBSITE)
  .transform((value) => {
    if (!value) return null;
    return /^https?:\/\//i.test(value) ? value : `https://${value}`;
  })
  .refine(
    (value) => value === null || URL.canParse(value),
    PROFILE_CLIENT.VALIDATION_WEBSITE,
  );

export const UpdateOrganizationProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, PROFILE_CLIENT.VALIDATION_NAME_SHORT)
    .max(80, PROFILE_CLIENT.VALIDATION_NAME_LONG),
  type: z.enum(organizationTypes, PROFILE_CLIENT.VALIDATION_TYPE),
  email: OptionalEmailSchema,
  phone: optionalText(30, PROFILE_CLIENT.VALIDATION_PHONE),
  website: OptionalWebsiteSchema,
  addressLine1: optionalText(120, PROFILE_CLIENT.VALIDATION_ADDRESS),
  addressLine2: optionalText(120, PROFILE_CLIENT.VALIDATION_ADDRESS),
  city: optionalText(80, PROFILE_CLIENT.VALIDATION_LOCATION),
  region: optionalText(80, PROFILE_CLIENT.VALIDATION_LOCATION),
  postalCode: optionalText(20, PROFILE_CLIENT.VALIDATION_POSTAL_CODE),
  country: optionalText(80, PROFILE_CLIENT.VALIDATION_LOCATION),
});

export type TUpdateOrganizationProfileInput = z.input<typeof UpdateOrganizationProfileSchema>;
export type TUpdateOrganizationProfile = z.output<typeof UpdateOrganizationProfileSchema>;
