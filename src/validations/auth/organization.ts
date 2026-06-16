import { z } from "zod";

import {
  ORGANIZATION_TYPES,
  REGISTER_ORGANIZATION_CLIENT,
} from "@/constants/auth/register-organization";

const typeValues = ORGANIZATION_TYPES.map((t) => t.value);

export const OrganizationSchema = z.object({
  name: z
    .string()
    .min(2, REGISTER_ORGANIZATION_CLIENT.VALIDATION_NAME_TOO_SHORT)
    .max(80, REGISTER_ORGANIZATION_CLIENT.VALIDATION_NAME_TOO_LONG),
  type: z.enum(typeValues, REGISTER_ORGANIZATION_CLIENT.VALIDATION_TYPE_REQUIRED),
});

export type TOrganizationSchema = z.infer<typeof OrganizationSchema>;
