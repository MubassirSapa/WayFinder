import { z } from "zod";

import { USER_MANAGEMENT_CLIENT } from "../constants/user-management.constants";

export const UpdateOrgUserInfoSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, USER_MANAGEMENT_CLIENT.VALIDATION_NAME_SHORT)
    .max(80, USER_MANAGEMENT_CLIENT.VALIDATION_NAME_LONG),
});

export type TUpdateOrgUserInfoSchema = z.infer<typeof UpdateOrgUserInfoSchema>;
