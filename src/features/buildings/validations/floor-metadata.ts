import { z } from "zod";

import { BUILDINGS_CLIENT } from "../constants/buildings.constants";

export const FloorMetadataSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, BUILDINGS_CLIENT.VALIDATION_NAME_SHORT)
    .max(80, BUILDINGS_CLIENT.VALIDATION_NAME_LONG),
  level: z.coerce.number().int(),
  width: z.coerce.number().positive(),
  height: z.coerce.number().positive(),
  metersPerPixel: z.coerce.number().positive().optional(),
  status: z.enum(["draft", "published"]),
});

export type TFloorMetadataSchema = z.infer<typeof FloorMetadataSchema>;
