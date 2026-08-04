import { z } from "zod";

import { BUILDINGS_CLIENT } from "../constants/buildings.constants";

export const CreateFloorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, BUILDINGS_CLIENT.VALIDATION_FLOOR_NAME_SHORT)
    .max(80, BUILDINGS_CLIENT.VALIDATION_FLOOR_NAME_LONG),
  level: z.number().int(),
  buildingId: z.string().min(1),
  publish: z.boolean(),
});

export type TCreateFloorSchema = z.infer<typeof CreateFloorSchema>;
