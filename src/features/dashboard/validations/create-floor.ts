import { z } from "zod";

import { DASHBOARD_CLIENT } from "@/features/dashboard/constants/dashboard.constants";

export const CreateFloorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, DASHBOARD_CLIENT.VALIDATION_NAME_SHORT)
    .max(80, DASHBOARD_CLIENT.VALIDATION_NAME_LONG),
  level: z.number().int(),
  buildingId: z.string().min(1),
  publish: z.boolean(),
});

export type TCreateFloorSchema = z.infer<typeof CreateFloorSchema>;
