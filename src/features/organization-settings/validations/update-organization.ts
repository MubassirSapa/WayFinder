import { z } from "zod";

import { ORGANIZATION_TYPES } from "@/features/auth/constants/register-organization";
import { ORGANIZATION_SETTINGS_CLIENT } from "../constants/organization-settings.constants";
import type { OrganizationType } from "../types/organization-settings.types";

const ORGANIZATION_TYPE_VALUES = ORGANIZATION_TYPES.map((type) => type.value) as [
  OrganizationType,
  ...OrganizationType[],
];

export const UpdateOrganizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, ORGANIZATION_SETTINGS_CLIENT.VALIDATION_NAME_SHORT)
    .max(120, ORGANIZATION_SETTINGS_CLIENT.VALIDATION_NAME_LONG),
  type: z.enum(ORGANIZATION_TYPE_VALUES, { message: ORGANIZATION_SETTINGS_CLIENT.VALIDATION_TYPE_REQUIRED }),
});

export type TUpdateOrganizationSchema = z.infer<typeof UpdateOrganizationSchema>;
