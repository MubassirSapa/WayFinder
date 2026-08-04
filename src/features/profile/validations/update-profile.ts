import { z } from "zod";

import { PROFILE_CLIENT } from "../constants/profile.constants";

export const UpdateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, PROFILE_CLIENT.VALIDATION_NAME_SHORT)
    .max(80, PROFILE_CLIENT.VALIDATION_NAME_LONG),
});

export type TUpdateProfileSchema = z.infer<typeof UpdateProfileSchema>;
