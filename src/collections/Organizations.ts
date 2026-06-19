import type { CollectionConfig } from "payload";

import { ORGANIZATION_TYPES } from "@/features/auth/constants/register-organization";
import { access } from "./access";

export const Organizations: CollectionConfig = {
  slug: "organizations",

  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "type"],
  },

  access: {
    // Created during public signup (via overrideAccess in the auth adapter).
    create: access.isAdmin,
    read: access.isLoggedIn,
    update: access.isAdmin,
    delete: access.isAdmin,
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
