import type { CollectionConfig } from "payload";

import { ORGANIZATION_TYPES } from "@/features/auth/constants/register-organization";
import { access } from "./access";

export const Organizations: CollectionConfig = {
  slug: "organizations",

  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "type"],
  },

  // Every relation to `organizations` currently only reads `name` (and
  // sometimes `type`) after populating it — keep that the default so a
  // deeply nested populate (e.g. floor -> building -> organization) doesn't
  // drag the whole document along for one string.
  defaultPopulate: {
    name: true,
    type: true,
  },

  access: {
    // Created during public signup (via overrideAccess in the auth adapter).
    create: access.isPlatformAdmin,
    read: access.isLoggedIn,
    update: access.isPlatformAdmin,
    delete: access.isPlatformAdmin,
  },

  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "type",
      type: "select",
      required: true,
      options: ORGANIZATION_TYPES.map((t) => ({ value: t.value, label: t.label })),
    },
  ],
};
