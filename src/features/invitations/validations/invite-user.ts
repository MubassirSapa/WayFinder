import { z } from "zod";

import { INVITATIONS_CLIENT } from "../constants/invitations.constants";

export const InviteUserSchema = z.object({
  name: z.string().trim().min(2, INVITATIONS_CLIENT.VALIDATION_NAME_SHORT).max(80),
  email: z.string().trim().toLowerCase().email(INVITATIONS_CLIENT.VALIDATION_EMAIL_INVALID),
  role: z.enum(["manager", "member"]),
  buildingIds: z.array(z.string()),
});

export type TInviteUserSchema = z.infer<typeof InviteUserSchema>;
