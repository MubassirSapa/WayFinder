import { z } from "zod";

import { USER_MANAGEMENT_CLIENT } from "../constants/user-management.constants";

export const CreateOrgUserSchema = z.object({
  name: z.string().trim().min(2, USER_MANAGEMENT_CLIENT.VALIDATION_NAME_SHORT).max(80),
  email: z.string().trim().toLowerCase().email(USER_MANAGEMENT_CLIENT.VALIDATION_EMAIL_INVALID),
  password: z.string().min(8, USER_MANAGEMENT_CLIENT.VALIDATION_PASSWORD_SHORT).max(128),
  role: z.enum(["manager", "member"]),
  buildingIds: z.array(z.string()),
});

export type TCreateOrgUserSchema = z.infer<typeof CreateOrgUserSchema>;
