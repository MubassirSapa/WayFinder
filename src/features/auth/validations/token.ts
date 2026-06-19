import { z } from "zod";

import Fields from "@/validations/shared";

export const TokenSchema = z.object({
  token: Fields.token(),
});

export type TTokenSchema = z.infer<typeof TokenSchema>;
