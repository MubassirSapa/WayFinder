import { z } from "zod";

import { BUILDINGS_CLIENT } from "../constants/buildings.constants";

export const BuildingFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, BUILDINGS_CLIENT.VALIDATION_NAME_SHORT)
    .max(120, BUILDINGS_CLIENT.VALIDATION_NAME_LONG),
  address: z.string().trim().max(240).optional().default(""),
  contactEmail: z
    .union([z.literal(""), z.string().trim().email(BUILDINGS_CLIENT.VALIDATION_EMAIL_INVALID)])
    .optional()
    .default(""),
  contactPhone: z.string().trim().max(40).optional().default(""),
  website: z.string().trim().max(200).optional().default(""),
});

export type TBuildingFormSchema = z.infer<typeof BuildingFormSchema>;
